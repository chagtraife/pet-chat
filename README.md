# 🐾 Pet Chatbox Browser Extension

Pet Chatbox là một **browser extension** có thú cưng (pet) chat với
người dùng, chạy bằng **LLM API (model mini)**, hỗ trợ **nhiều user**,
**tự quản lý context**, và **auto summarize** để tiết kiệm token.

## ✨ Tính năng

-   🐱 Pet chatbox trong browser extension
-   👥 Multi-user, multi-session (không lẫn context)
-   🧠 Auto summarize context khi chat dài
-   💸 Dùng model mini → chi phí thấp
-   ⚡ Backend mỏng, dễ chỉnh sửa

## 📁 Cấu trúc thư mục

    petchat/
    ├─ backend/
    ├─ extension/
    ├─ .gitignore
    └─ README.md

## 🚀 Chạy Backend

``` bash
cd backend
npm install
node index.js
```

## 🧩 Chạy Extension

-   Mở chrome://extensions
-   Bật Developer mode
-   Load unpacked → chọn thư mục extension

## 📜 License

MIT
