const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	entry: {
		index: path.resolve(__dirname, ".", "src", "app", "index.tsx"),
		backgound: path.resolve(__dirname, ".", "src", "js", "background.ts"),
		"content-style": path.resolve(__dirname, ".", "src", "style", "content-style.scss"),
	},
	output: {
		path: path.join(__dirname, "dist"),
		filename: "js/[name].bundle.js",
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".json"],
		alias: {
			"@app": path.resolve(__dirname, "src/app"),
			"@js": path.resolve(__dirname, "src/js"),
			"@style": path.resolve(__dirname, "src/style"),
		},
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.scss$/,
				use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.html$/,
				use: ["html-loader"],
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: "asset/resource",
				generator: {
					filename: "assets/imgs/[hash][ext][query]",
				},
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: "asset/resource",
				generator: {
					filename: "assets/fonts/[name][ext][query]",
				},
			},
		],
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: ".", to: ".", context: "public" },
				{ from: "popup.html", to: "popup.html" },
				{ from: "popup.js", to: "popup.js" },
				{ from: "popup.css", to: "popup.css" },
			],
		}),
		new MiniCssExtractPlugin({ filename: "style/[name].css" }),
	],
};
