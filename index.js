/**
 * Meta MusicGen - Zeabur 優化版本
 * 修復 Hugging Face API 冷啟動問題
 * GitHub: https://github.com/kinai9661/Meta-MusicGen
 */

import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// 中間件
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// 配置
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY
const MODELS = {
  'musicgen-small': 'https://api-inference.huggingface.co/models/facebook/musicgen-small',
  'musicgen-medium': 'https://api-inference.huggingface.co/models/facebook/musicgen-medium',
  'musicgen-large': 'https://api-inference.huggingface.co/models/facebook/musicgen-large'
}

console.log(`
╔════════════════════════════════════════════════╗
║  🎵 Meta MusicGen - Zeabur Edition          ║
║  🚀 Platform: Zeabur Serverless               ║
║  ⚙️  Runtime: Node.js ${process.version}                 ║
║  📡 API Key: ${HUGGINGFACE_API_KEY ? '✓ Configured' : '✗ Missing'}                    ║
╚════════════════════════════════════════════════╝
`)

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    platform: 'Zeabur',
    runtime: 'Node.js',
    version: process.version,
    models: Object.keys(MODELS),
    apiKeyConfigured: !!HUGGINGFACE_API_KEY,
    timestamp: new Date().toISOString()
  })
})

// 智能重試函數 - 核心修復
async function generateWithRetry(modelUrl, prompt, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[嘗試 ${attempt + 1}/${maxRetries}] 調用模型: ${modelUrl.split('/').pop()}`)
      
      const response = await fetch(modelUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Meta-MusicGen/1.0'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 256,
            do_sample: true,
            temperature: 0.7,
            top_p: 0.9
          },
          options: {
            wait_for_model: true,  // 關鍵修復: 強制等待模型加載
            use_cache: false       // 不使用緩存,確保新鮮結果
          }
        })
      })

      // 成功響應
      if (response.ok) {
        console.log(`[成功] 模型響應正常,狀態碼: ${response.status}`)
        const audioBuffer = await response.buffer()
        console.log(`[成功] 獲取音頻數據: ${(audioBuffer.length / 1024).toFixed(2)} KB`)
        return audioBuffer
      }

      // 處理錯誤響應
      const errorText = await response.text()
      console.log(`[錯誤] HTTP ${response.status}: ${errorText.substring(0, 200)}`)
      
      // 檢查是否是模型加載中 (503 Service Unavailable)
      if (response.status === 503 || errorText.includes('loading') || errorText.includes('currently loading')) {
        const waitTime = 5000 * (attempt + 1) // 遞增等待時間: 5s, 10s, 15s...
        console.log(`[模型加載中] 等待 ${waitTime/1000} 秒後重試...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue // 繼續下一次嘗試
      }
      
      // 其他錯誤,拋出
      throw new Error(`API Error ${response.status}: ${errorText}`)
      
    } catch (error) {
      console.error(`[錯誤] 嘗試 ${attempt + 1} 失敗:`, error.message)
      
      // 最後一次嘗試失敗,拋出錯誤
      if (attempt === maxRetries - 1) {
        throw error
      }
      
      // 等待後重試
      const waitTime = 2000 * (attempt + 1)
      console.log(`[重試] ${waitTime/1000} 秒後進行下一次嘗試...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  throw new Error('超過最大重試次數')
}

// 音樂生成 API
app.post('/api/generate', async (req, res) => {
  const startTime = Date.now()
  
  try {
    const { prompt, model = 'musicgen-medium' } = req.body

    console.log(`\n[新請求] Prompt: "${prompt.substring(0, 50)}...", Model: ${model}`)

    if (!prompt) {
      return res.status(400).json({ 
        error: '請輸入音樂描述',
        hint: 'prompt 參數不能為空'
      })
    }

    if (!HUGGINGFACE_API_KEY) {
      console.error('[配置錯誤] 未設置 HUGGINGFACE_API_KEY')
      return res.status(500).json({ 
        error: '服務器配置錯誤',
        hint: '請在 Zeabur Dashboard 設置環境變量 HUGGINGFACE_API_KEY',
        docs: 'https://huggingface.co/settings/tokens'
      })
    }

    const modelUrl = MODELS[model] || MODELS['musicgen-medium']
    
    // 使用智能重試函數
    const audioBuffer = await generateWithRetry(modelUrl, prompt)
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`[完成] 總耗時: ${duration} 秒\n`)
    
    // 返回音頻文件
    res.set({
      'Content-Type': 'audio/flac',
      'Content-Disposition': `attachment; filename="music_${Date.now()}.flac"`,
      'Content-Length': audioBuffer.length,
      'X-Generation-Time': `${duration}s`
    })
    res.send(audioBuffer)

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.error(`[失敗] 總耗時: ${duration} 秒, 錯誤:`, error.message)
    
    // 返回詳細錯誤信息
    res.status(500).json({ 
      error: '生成失敗',
      message: error.message,
      duration: `${duration}s`,
      hint: error.message.includes('loading') 
        ? '模型正在加載中,請稍等 30 秒後重試'
        : '請檢查網絡連接或稍後再試',
      timestamp: new Date().toISOString()
    })
  }
})

// API 文檔
app.get('/api', (req, res) => {
  res.json({
    name: 'Meta MusicGen API',
    version: '1.0.0',
    platform: 'Zeabur',
    endpoints: {
      generate: {
        path: '/api/generate',
        method: 'POST',
        description: '生成音樂',
        parameters: {
          prompt: '音樂描述 (required, string)',
          model: 'musicgen-small | musicgen-medium | musicgen-large (optional, default: medium)'
        },
        example: {
          prompt: 'upbeat electronic dance music with synthesizers',
          model: 'musicgen-medium'
        }
      },
      health: {
        path: '/health',
        method: 'GET',
        description: '健康檢查'
      }
    },
    notes: [
      '首次調用模型可能需要 20-30 秒冷啟動時間',
      '系統會自動重試最多 5 次',
      '建議使用 musicgen-medium 模型以平衡質量和速度'
    ]
  })
})

// 404 處理
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    availablePaths: ['/', '/api', '/api/generate', '/health']
  })
})

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('[全局錯誤]', err)
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  })
})

// 啟動服務器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 服務器運行中: http://0.0.0.0:${PORT}`)
  console.log(`✅ API 文檔: http://0.0.0.0:${PORT}/api`)
  console.log(`✅ 健康檢查: http://0.0.0.0:${PORT}/health`)
  console.log(`✅ 環境: ${process.env.NODE_ENV || 'development'}\n`)
})

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('\n收到 SIGTERM 信號,正在優雅關閉...')
  process.exit(0)
})