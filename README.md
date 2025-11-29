# 🎵 Meta MusicGen - Leapcell 版本

基於 Express.js 的 Meta MusicGen 音樂生成器，部署在 Leapcell Serverless 平台。

## ✨ 特性

- 🆓 **完全免費**: Leapcell 免費層級支持 20 個項目
- ⚡ **長超時**: 支持長達15分鐘的請求
- 💾 **內建數據庫**: PostgreSQL + Redis 支持
- 🚀 **快速部署**: 通過 GitHub 一鍵部署
- 💻 **完整 Node.js**: 支持所有 npm 包

## 🚀 快速部署

### 方法一: 通過 GitHub 部署 (推薦)

1. Fork 或 Clone 這個倉庫
2. 訪問 [Leapcell Console](https://console.leapcell.io)
3. 點擊 "New Project" → "Import from GitHub"
4. 選擇 `Meta-MusicGen` 倉庫和 `leapcell` 分支
5. 配置環境變量:
   - `HUGGINGFACE_API_KEY` = 你的 Hugging Face Token
6. 點擊 "Deploy"

### 方法二: 使用 Leapcell CLI

```bash
# 1. 安裝 Leapcell CLI
npm install -g @leapcell/cli

# 2. 登入
leapcell login

# 3. 初始化項目
leapcell init

# 4. 設置環境變量
leapcell env set HUGGINGFACE_API_KEY=your_token_here

# 5. 部署
leapcell deploy
```

## 💻 本地開發

```bash
# 安裝依賴
npm install

# 設置環境變量
export HUGGINGFACE_API_KEY=your_token_here

# 啟動開發服務器
npm start

# 訪問 http://localhost:3000
```

## 📖 API 文檔

### POST /api/generate

生成音樂

**請求體:**
```json
{
  "prompt": "upbeat electronic music with synthesizers",
  "model": "musicgen-medium"
}
```

**響應:**
- 成功: 返回 FLAC 音頻文件
- 失敗: JSON 錯誤信息

### GET /health

健康檢查

**響應:**
```json
{
  "status": "ok",
  "platform": "Leapcell",
  "runtime": "Node.js",
  "models": ["musicgen-small", "musicgen-medium", "musicgen-large"],
  "apiKeyConfigured": true
}
```

## ⚙️ 配置

### 環境變量

| 變量名 | 說明 | 必需 |
|--------|------|------|
| `HUGGINGFACE_API_KEY` | Hugging Face API Token | ✅ 是 |
| `PORT` | 服務器端口 (默認 3000) | ❌ 否 |

### 獲取 Hugging Face Token

1. 訪問 [Hugging Face Settings - Tokens](https://huggingface.co/settings/tokens)
2. 創建新 Token (Read 權限即可)
3. 複製 Token

## 📊 Leapcell vs Cloudflare Workers

| 特性 | Leapcell | Cloudflare Workers |
|------|----------|-------------------|
| 免費項目 | 20 個 | 無限 |
| 超時限制 | 15 分鐘 | 30 秒 (付費 10 分鐘) |
| Node.js 支持 | ✅ 完整 | ⚠️ 受限 |
| 數據庫 | ✅ 內建 | ❌ 需配置 |
| 冷啟動 | <250ms | <10ms |

## 🛠️ 技術棧

- **後端**: Express.js + Node.js
- **AI 模型**: Meta MusicGen (Hugging Face)
- **前端**: HTML5 + TailwindCSS
- **平台**: Leapcell Serverless

## 📝 許可證

MIT License - 詳見 [LICENSE](../LICENSE) 文件

## 🔗 相關鏈接

- [Leapcell 官網](https://leapcell.io)
- [Leapcell 文檔](https://docs.leapcell.io)
- [Hugging Face MusicGen](https://huggingface.co/facebook/musicgen-medium)
- [GitHub 倉庫](https://github.com/kinai9661/Meta-MusicGen)

---

由 [kinai9661](https://github.com/kinai9661) 用 ❤️ 和 ☕ 製作