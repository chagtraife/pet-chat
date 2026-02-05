# 🏗️ Pet-Chat Architecture - Hướng dẫn Luồng Hoạt động

## 📊 Sơ đồ Tổng quát Hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                     🌐 CHROME BROWSER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔌 EXTENSION (pet-chat/extension)                      │   │
│  │                                                           │   │
│  │  1. Content Script (trang web bất kỳ)                   │   │
│  │     └─> Render Pet trên trang web                       │   │
│  │     └─> Tương tác với người dùng                        │   │
│  │                                                           │   │
│  │  2. Popup (chrome-extension://...)                       │   │
│  │     └─> Chat interface                                  │   │
│  │     └─> Gửi message tới Backend                         │   │
│  │                                                           │   │
│  │  3. Background Service Worker                            │   │
│  │     └─> Quản lý trạng thái Pet (vui/chán/đói/mệt)      │   │
│  │     └─> Trigger actions định kỳ (1 phút/lần)            │   │
│  │                                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↕ (HTTP)                              │
│                  fetch("localhost:3000/chat")                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────────────────┐
│         🖥️ BACKEND (pet-chat/backend) - Node.js/Express        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /chat                                                      │
│  ├─> Get/Save User Memory (conversation history)               │
│  ├─> Summarize if too long (save tokens)                        │
│  ├─> Build Prompt                                               │
│  └─> Call LLM (OpenAI API)                                      │
│      └─> Return response                                        │
│                                                                   │
│  (Tương lai: POST /detect-pose)                                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────────────────┐
│   🤖 POSE DETECTION (pet-chat/pose_detection) - Python/Docker  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  animal_pose.py                                                  │
│  ├─> Nhập: ảnh/video động vật                                   │
│  ├─> Xử lý bằng MMPose Model                                    │
│  └─> Xuất: 17 keypoints (mắt, mũi, chân, đuôi, v.v.)          │
│                                                                   │
│  main.py                                                         │
│  └─> Visualize skeleton của động vật                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────────────────────┐
│        🔑 EXTERNAL SERVICES                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  OpenAI API (gpt-4-mini hoặc gpt-5-nano)                        │
│  └─> Chat với Pet thông minh                                    │
│                                                                   │
│  Chrome Storage API                                              │
│  └─> Lưu trạng thái Pet                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Luồng Chi tiết: User Chat với Pet

```
1️⃣  USER gõ tin nhắn trong popup
     └─> popup.js nhận event keydown

2️⃣  popup.js fetch POST tới http://localhost:3000/chat
     {
       userId: "user-xxx",
       sessionId: "default",
       message: "Xin chào pet"
     }

3️⃣  BACKEND (index.js) nhận request
     ├─> getMemory(userId:sessionId) → lấy lịch sử chat
     ├─> Thêm message của user vào messages
     ├─> summarizeIfNeeded() → tóm tắt nếu > 20 messages
     ├─> buildPrompt() → tạo prompt cho LLM
     └─> callLLM() → gọi OpenAI API

4️⃣  LLM (OpenAI) trả về response
     └─> "Xin chào! 🐱 Tôi vui lắm khi được gặp bạn"

5️⃣  BACKEND lưu memory + trả response về extension
     └─> saveMemory(userId:sessionId, messages)
     └─> res.json({ reply: "..." })

6️⃣  popup.js nhận response + hiển thị
     └─> chat.innerHTML += `<div>🐱 ${data.reply}</div>`
```

---

## 🐱 Luồng Chi tiết: Pet Animation & Actions

```
1️⃣  Background Service Worker (background.ts) khởi động
     └─> Tạo SpriteEngine
     └─> Tạo alarm "sprite-status-sync" mỗi 1 phút

2️⃣  Mỗi 1 phút, alarm trigger:
     ├─> Cập nhật happinessLevel (giảm dần)
     ├─> Cập nhật satedLevel (cảm giác no)
     ├─> Cập nhật energyLevel (năng lượng)
     └─> Trigger action dựa trên trạng thái

3️⃣  Content Script (index.tsx) được inject vào web page:
     ├─> Tạo Shadow DOM container
     ├─> Render Pet animation (React component)
     ├─> Xử lý sprite actions:
     │   ├─> IdleAction (đứng yên)
     │   ├─> WalkOnEdgeAction (đi bộ)
     │   ├─> JumpAction (nhảy)
     │   ├─> SleepAction (ngủ)
     │   ├─> EatFoodAction (ăn)
     │   └─> ScatterLettersAction (xáo trộn chữ)
     └─> Menu để tương tác

4️⃣  Pet Renderer (pet-renderer.ts):
     ├─> Load cat sprite từ public/assets/cat.json (Spine format)
     ├─> Sử dụng PixiJS để render
     └─> Animate based on current action
```

---

## 📁 Cấu trúc File Quan Trọng

### Extension (Chromium)
```
extension/
├── popup.html          → UI popup chat
├── popup.js            → Logic chat (gọi backend)
├── popup.css           → Style popup
├── tsconfig.json       → Config TypeScript
├── webpack.*.js        → Build config
│
├── src/
│   ├── app/
│   │   ├── index.tsx              → Main React app
│   │   ├── pet-renderer.ts        → Render pet sprite
│   │   ├── components/
│   │   │   ├── sprite-menu/       → Menu tương tác
│   │   │   └── spawned-sprites/   → Render sprites
│   │   └── app-context/
│   │       └── store-context.tsx  → Global state
│   │
│   ├── js/
│   │   ├── background.ts          → Service worker
│   │   ├── engines.ts             → Engine instances
│   │   ├── sprite-engine.ts       → Quản lý sprite
│   │   ├── sprite-actions/        → Các action pet
│   │   │   ├── eat-food-action.ts
│   │   │   ├── sleep-action.ts
│   │   │   ├── walk-on-edge-action.ts
│   │   │   └── ...
│   │   ├── spawnable-objects/     → Food, items
│   │   └── utils/
│   │       └── constants.ts
│   │
│   └── style/
│       └── *.scss
│
└── public/
    ├── manifest.json              → Manifest v3
    ├── assets/
    │   ├── cat.json               → Pet sprite (Spine)
    │   ├── cat.atlas
    │   └── fonts/
    ├── images/
    │   ├── icons/
    │   └── objects/
    └── templates/
        ├── sprite.template.html
        └── animations.template.html
```

### Backend (Node.js)
```
backend/
├── index.js            → Express server + /chat endpoint
├── llm.js              → Call OpenAI API
├── memory.js           → Store conversation (In-memory)
├── prompt.js           → Build prompt
├── summarize.js        → Summarize old messages
└── package.json
```

### Pose Detection (Python)
```
pose_detection/
├── animal_pose.py      → MMPose inference (detect 17 keypoints)
├── main.py             → Visualize keypoints
├── run.sh              → Docker run script
├── Dockerfile          → Docker config
└── setup.md            → Manual setup guide
```

---

## 🚀 Để Chạy Hệ thống (Hiện Tại)

### Terminal 1: Backend
```bash
cd backend
npm install
OPENAI_API_KEY=sk-xxx node index.js
# → Running on http://localhost:3000
```

### Terminal 2: Build & Load Extension
```bash
cd extension
npm install
npm run build
# → Load dist/ folder vào Chrome (chrome://extensions)
```

### Trên Chrome
1. Mở bất kỳ trang web nào
2. Mở popup extension (click icon pet)
3. Chat với pet
4. Pet sẽ hiển thị trên trang web

---

## 🔗 Kết Nối Pose Detection (Tương Lai)

### Option 1: Thêm endpoint vào Backend
```javascript
// backend/index.js
app.post("/detect-pose", async (req, res) => {
  const { imageData } = req.body;
  
  // Gọi Python script qua child_process
  const coordinates = await runPoseDetection(imageData);
  
  res.json({ coordinates });
});
```

### Option 2: Microservice riêng (Flask)
```python
# pose_detection/app.py
from flask import Flask, request
from animal_pose import detect_animal_pose

app = Flask(__name__)

@app.route('/detect', methods=['POST'])
def detect():
    image_data = request.json['image']
    coords = detect_animal_pose(image_data)
    return {'coordinates': coords}

if __name__ == '__main__':
    app.run(port=5000)
```

### Extension gọi:
```javascript
// Sau khi có pose data:
const poseRes = await fetch("http://localhost:5000/detect", {
  method: "POST",
  body: JSON.stringify({ image: imageData })
});
```

---

## 📋 Checklist Để Hệ Thống Hoạt động

- [ ] **Backend chạy**
  - `npm install` trong `/backend`
  - Set `OPENAI_API_KEY` environment variable
  - `node index.js` → port 3000

- [ ] **Extension built**
  - `npm install` trong `/extension`
  - `npm run build` → tạo folder `/dist`

- [ ] **Load Extension vào Chrome**
  - `chrome://extensions`
  - Enable "Developer mode"
  - "Load unpacked" → chọn `/dist` folder

- [ ] **Test Pet trên web page**
  - Mở bất kỳ trang web (vd: google.com)
  - Click icon pet extension
  - Chat trong popup
  - Pet hiển thị + animate trên trang

- [ ] **Pose Detection (tương lai)**
  - Setup Docker / Python environment
  - Thêm endpoint `/detect-pose`
  - Integrate với extension

---

## 🐛 Debug Tips

**Extension không hiển thị?**
- Kiểm tra Chrome console (`Inspect > Console`)
- Kiểm tra backend chạy `curl http://localhost:3000`

**Backend gặp lỗi?**
- Kiểm tra `OPENAI_API_KEY`
- Kiểm tra port 3000 không bị chiếm

**Build extension thất bại?**
- Xóa `node_modules` + `npm install` lại
- Xóa `dist` folder + build lại
