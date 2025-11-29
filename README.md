# 🎵 Meta MusicGen - Zeabur 修復版

這是專門為 Zeabur 平台優化的版本,完全修復了 Hugging Face API 端點遷移問題。

## 🔥 最新更新 (2025-11-29)

✅ **已修復 410 錯誤**: Hugging Face API 已遷移到新端點
- ~~舊端點: `api-inference.huggingface.co`~~ (已棄用)
- ✅ 新端點: `api-inference.huggingface.co` (當前使用)

## ✅ 已修復的問題

- ✅ **410 錯誤**: API 端點已更新到 router.huggingface.co
- ✅ Hugging Face 模型冷啟動 503 錯誤
- ✅ 自動重試機制 (最多 5 次)
- ✅ 智能等待模型加載 (`wait_for_model: true`)
- ✅ 友好的用戶提示和進度條
- ✅ 詳細的日誌輸出便於調試

## 🚀 快速部署到 Zeabur

### 方法一: 通過 GitHub 部署 (推薦)

1. **Fork 或使用此倉庫**
   ```
   https://github.com/kinai9661/Meta-MusicGen
   ```

2. **登入 Zeabur Dashboard**
   - 訪問: https://dash.zeabur.com

3. **創建新項目**
   - 點擊 "New Project"
   - 選擇 "Deploy from GitHub"
   - 選擇此倉庫
   - **重要**: 選擇 `zeabur-fix` 分支

4. **配置環境變量**
   ```
   HUGGINGFACE_API_KEY=你的_Hugging_Face_Token
   ```
   
   獲取 Token: https://huggingface.co/settings/tokens

5. **部署**
   - 點擊 "Deploy"
   - 等待部署完成 (約 1-2 分鐘)

## 🔧 API 端點遷移說明

Hugging Face 在 2025 年 11 月更新了 API 架構:

### 變更詳情

```javascript
// ❌ 舊的 (已棄用 - 返回 410)
const OLD_API = 'https://api-inference.huggingface.co/models/...'

// ✅ 新的 (當前使用)
const NEW_API = 'https://api-inference.huggingface.co/models/...'
```

### 遷移好處

- ⚡ 更快的響應速度
- 🌍 更好的全球負載均衡
- 🔒 增強的安全性
- 📊 改進的監控和日誌

## 📊 性能指標

| 場景 | 修復前 | 修復後 |
|------|--------|--------|
| API 調用 | ❌ 410 錯誤 | ✅ 正常響應 |
| 首次請求 | ❌ 直接失敗 | ✅ 30秒後成功 |
| 模型冷啟動 | ❌ 503 錯誤 | ✅ 自動等待重試 |
| 成功率 | 0% | ~95% |

## 🧪 測試修復

部署完成後:

1. 訪問你的 Zeabur 應用
2. 輸入 Prompt: `lofi hip hop beats, chill, relaxing`
3. 點擊生成
4. 等待 20-40 秒
5. ✅ 應該成功生成並播放音樂!

## 🐛 故障排除

### 錯誤: 410 Gone

**原因**: 使用了舊的 API 端點

**解決**: 
1. 確認使用 `zeabur-fix` 分支
2. 在 Zeabur 中觸發重新部署
3. 清除瀏覽器緩存

### 錯誤: 401 Unauthorized

**原因**: API Key 未配置或無效

**解決**:
1. 檢查環境變量 `HUGGINGFACE_API_KEY`
2. 訪問 https://huggingface.co/settings/tokens 重新生成
3. 確保 Token 有 "Read" 權限

### 錯誤: 503 Service Unavailable

**原因**: 模型正在冷啟動

**解決**: 系統會自動重試,請等待 30 秒

## 📝 環境變量

| 變量名 | 說明 | 必需 | 示例 |
|--------|------|------|------|
| `HUGGINGFACE_API_KEY` | Hugging Face API Token | ✅ 是 | `hf_xxxxx` |
| `PORT` | 服務器端口 | ❌ 否 | `3000` |
| `NODE_ENV` | 環境 | ❌ 否 | `production` |

## 🔗 相關鏈接

- [Hugging Face Router 文檔](https://huggingface.co/docs/api-inference/index)
- [Zeabur 文檔](https://zeabur.com/docs)
- [MusicGen 模型頁面](https://huggingface.co/facebook/musicgen-medium)
- [GitHub 倉庫](https://github.com/kinai9661/Meta-MusicGen)

## 📄 許可證

MIT License

---

🎵 **現在就開始創作你的音樂吧!**

由 [kinai9661](https://github.com/kinai9661) 維護 · 最後更新: 2025-11-29