# 🎵 Meta MusicGen Free - 完全免費的 AI 音樂生成器

基於 Cloudflare Workers 和 Hugging Face (Meta MusicGen) 的完全免費音樂生成服務，類似 Vidnoz 功能。

## ✨ 特性

- 🆓 **完全免費**: 利用 Hugging Face Free Tier 和 Cloudflare Workers 免費額度
- 🎨 **美觀界面**: 現代化暗色系 UI，支持移動端
- 🚀 **無需後端**: 純 Serverless 架構，一鍵部署
- 🎼 **多模型支持**: MusicGen Small/Medium/Large
- 💼 **可商用**: 生成的音樂可免費商用
- 🌐 **無需註冊**: 用戶無需註冊即可使用

## 🎯 功能對比

| 功能 | Vidnoz | Meta MusicGen (本項目) |
|------|--------|----------------------|
| 文字轉音樂 | ✅ | ✅ |
| 多種風格 | ✅ | ✅ |
| 免費使用 | ✅ | ✅ |
| 可商用 | ✅ | ✅ |
| 無需註冊 | ❌ | ✅ |
| 自托管 | ❌ | ✅ |
| 部署成本 | N/A | $0 |
| 生成時長 | 120秒+ | 10-30秒 |

## 🚀 快速部署

### 1. 克隆倉庫

```bash
git clone https://github.com/kinai9661/Meta-MusicGen.git
cd Meta-MusicGen
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 獲取 Hugging Face API Token

1. 訪問 [Hugging Face Settings - Tokens](https://huggingface.co/settings/tokens)
2. 創建一個新 Token (Read 權限即可)
3. 複製 Token

### 4. 配置 API Key

```bash
npx wrangler secret put HUGGINGFACE_API_KEY
# 粘貼你的 Hugging Face Token
```

### 5. 部署到 Cloudflare Workers

```bash
npm run deploy
```

部署成功後，你會獲得一個網址，例如:
```
https://meta-musicgen-free.your-subdomain.workers.dev
```

## 💻 本地開發

```bash
# 開發模式 (本地測試)
npm run dev

# 訪問 http://localhost:8787
```

## 📖 使用方法

### Web 界面

1. 訪問部署後的網址
2. 在「音樂描述」框輸入你想要的音樂風格，例如：
   - "一首輕快的日系 City Pop，包含合成器和放克貝斯"
   - "史詩般的電影配樂，充滿戲劇性"
   - "放鬆的 Lofi Hip Hop 節拍"
3. 選擇模型 (推薦 Medium)
4. 點擊「開始生成音樂」
5. 等待約 20-30 秒
6. 播放並下載生成的音樂

### API 調用

```javascript
// 生成音樂
const response = await fetch('https://your-worker.workers.dev/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: '一首輕快的電子音樂',
    model: 'musicgen-medium'
  })
})

// 獲取音頻 Blob
const audioBlob = await response.blob()
const audioUrl = URL.createObjectURL(audioBlob)

// 播放
const audio = new Audio(audioUrl)
audio.play()
```

## 🎼 支持的模型

| 模型 | 描述 | 速度 | 質量 |
|------|------|------|------|
| `musicgen-small` | 快速生成，適合快速測試 | ⚡⚡⚡ | ⭐⭐ |
| `musicgen-medium` | 平衡速度和質量 (推薦) | ⚡⚡ | ⭐⭐⭐ |
| `musicgen-large` | 最高質量，生成較慢 | ⚡ | ⭐⭐⭐⭐ |

## 🎨 預設風格

- **Lofi Hip Hop**: 放鬆的節奏，適合學習/工作
- **史詩電影感**: 管弦樂，適合預告片/宣傳片
- **賽博龐克**: 未來感電子音樂
- **日系 City Pop**: 80年代日本流行風格
- **感人鋼琴曲**: 鋼琴獨奏，情感豐富

## 📁 項目結構

```
Meta-MusicGen/
├── README.md              # 項目說明
├── LICENSE                # MIT 許可證
├── package.json           # npm 配置
├── wrangler.toml          # Cloudflare Workers 配置
├── .gitignore             # Git 忽略文件
└── src/
    └── index.js           # 主程序 (前端+後端)
```

## ⚙️ 配置說明

### wrangler.toml

```toml
name = "meta-musicgen-free"
main = "src/index.js"
compatibility_date = "2025-11-29"

[vars]
ENVIRONMENT = "production"
```

### 環境變量

| 變量名 | 說明 | 必需 |
|--------|------|------|
| `HUGGINGFACE_API_KEY` | Hugging Face API Token | ✅ 是 |

## 🔧 進階配置

### 自定義域名

在 `wrangler.toml` 中添加:

```toml
[[routes]]
pattern = "music.yourdomain.com/*"
zone_name = "yourdomain.com"
```

### 修改超時時間

在 `src/index.js` 中修改:

```javascript
const CONFIG = {
  API_TOKEN_VAR: 'HUGGINGFACE_API_KEY',
  TIMEOUT: 60000 // 修改這裡 (毫秒)
}
```

## ⚠️ 注意事項

### Hugging Face 免費 API 限制

- **冷啟動**: 第一次調用模型可能需要 20-30 秒加載
- **排隊**: 高峰期可能需要等待
- **時長限制**: 免費 API 生成約 10-30 秒音樂
- **速率限制**: 有請求頻率限制

### 解決方案

1. **模型冷啟動**: 等待 30 秒後重試
2. **生成時長**: 使用多次生成並拼接
3. **提高質量**: 使用 `musicgen-large` 模型

## 🛠️ 技術棧

- **後端**: Cloudflare Workers (Serverless)
- **AI 模型**: Meta MusicGen (Hugging Face)
- **前端**: HTML5 + TailwindCSS
- **部署**: Wrangler CLI

## 📊 性能數據

- **冷啟動**: ~20-30 秒
- **熱請求**: ~5-10 秒
- **音頻格式**: FLAC (無損)
- **採樣率**: 32kHz
- **比特率**: 自動

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request!

## 📝 許可證

MIT License - 詳見 [LICENSE](LICENSE) 文件

## 🔗 相關鏈接

- [Meta MusicGen 論文](https://arxiv.org/abs/2306.05284)
- [Hugging Face MusicGen](https://huggingface.co/facebook/musicgen-medium)
- [Cloudflare Workers 文檔](https://developers.cloudflare.com/workers/)

## 💡 常見問題

### Q: 為什麼生成失敗?

A: 可能原因:
1. 模型正在冷啟動 (等待 30 秒重試)
2. Hugging Face API Token 未配置或無效
3. 網絡連接問題

### Q: 可以生成更長的音樂嗎?

A: 免費 API 限制單次生成約 10-30 秒。可以:
1. 多次生成並拼接
2. 使用付費的 Hugging Face Inference Endpoints
3. 自建 MusicGen 服務器

### Q: 生成的音樂可以商用嗎?

A: 是的，Meta MusicGen 模型採用 CC-BY 4.0 許可證，生成的音樂可以商用。

### Q: 如何提高生成質量?

A: 
1. 使用 `musicgen-large` 模型
2. 提供更詳細的 Prompt 描述
3. 多次生成選擇最佳結果

## 🎉 示例 Prompts

```
✅ 好的 Prompt:
- "upbeat electronic dance music with synthesizers, 120 BPM, energetic"
- "sad piano solo, slow tempo, emotional and melancholic"
- "cinematic orchestral epic trailer music, dramatic strings"

❌ 不好的 Prompt:
- "音樂" (太模糊)
- "好聽的歌" (缺乏細節)
```

## 📧 聯繫方式

- GitHub: [@kinai9661](https://github.com/kinai9661)
- Issues: [提交問題](https://github.com/kinai9661/Meta-MusicGen/issues)

---

⭐ 如果這個項目對你有幫助，請給個 Star!

由 [kinai9661](https://github.com/kinai9661) 用 ❤️ 和 ☕ 製作
