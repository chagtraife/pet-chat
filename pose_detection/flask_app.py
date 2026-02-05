#!/usr/bin/env python3
"""
Flask API wrapper for Animal Pose Detection
Integrates with pet-chat backend
"""

import os
import json
import base64
import tempfile
from flask import Flask, request, jsonify
from animal_pose import main as run_pose_detection
import subprocess
import re
import numpy as np

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "pose-detection"
    })


@app.route('/detect', methods=['POST'])
def detect_pose():
    """
    Detect animal pose from image
    
    Request JSON:
    {
        "image": "base64_encoded_image_data",
        "format": "jpg"  # optional, default: jpg
    }
    
    Response:
    {
        "success": true,
        "keypoints": [[x1, y1], [x2, y2], ...],  # 17 keypoints
        "keypoint_names": ["nose", "left_eye", ...]
    }
    """
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "Missing image data"}), 400
        
        # Decode image
        image_data = base64.b64decode(data['image'])
        
        # Save to temp file
        with tempfile.NamedTemporaryFile(
            suffix=f".{data.get('format', 'jpg')}", 
            delete=False
        ) as tmp:
            tmp.write(image_data)
            tmp_path = tmp.name
        
        try:
            # Run pose detection (call Docker container)
            coordinates = detect_from_file(tmp_path)
            
            if not coordinates:
                return jsonify({
                    "success": False,
                    "error": "Could not detect pose"
                }), 400
            
            return jsonify({
                "success": True,
                "keypoints": coordinates,
                "keypoint_names": [
                    "nose", "left_eye", "right_eye", "left_ear", "right_ear",
                    "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
                    "left_wrist", "right_wrist", "left_hip", "right_hip",
                    "left_knee", "right_knee", "left_ankle", "right_ankle"
                ]
            })
        finally:
            os.unlink(tmp_path)
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


def detect_from_file(image_path):
    """
    Run pose detection on image file using Docker
    Returns list of [x, y] coordinates for each keypoint
    """
    try:
        # Copy image to Docker input folder
        os.makedirs('input', exist_ok=True)
        filename = os.path.basename(image_path)
        dest_path = os.path.join('input', filename)
        
        import shutil
        shutil.copy(image_path, dest_path)
        
        # Run Docker command
        process = subprocess.Popen(
            ["./run.sh", dest_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        coordinates = []
        for line in process.stdout:
            match = re.search(r"<start>(.*?)<end>", line)
            if match:
                try:
                    coords = json.loads(match.group(1))
                    coordinates.append(coords)
                except json.JSONDecodeError:
                    pass
        
        process.wait()
        return coordinates if coordinates else None
    
    except Exception as e:
        print(f"Error in detect_from_file: {e}")
        return None


@app.route('/detect-video', methods=['POST'])
def detect_video():
    """
    Detect animal pose from video
    Returns keypoints for each frame
    """
    try:
        data = request.json
        if not data or 'video' not in data:
            return jsonify({"error": "Missing video data"}), 400
        
        # Similar to detect_pose but for video
        return jsonify({
            "success": True,
            "frames": []  # TODO: implement
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
