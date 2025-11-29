/**
 * Meta MusicGen on Leapcell
 * Express.js 版本 - 支持完整 Node.js 環境
 * GitHub: https://github.com/kinai9661/Meta-MusicGen
 */

import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

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
  'musicgen-large': 'https://api-inference.huggingface.co/models/facebook/musicgen-large',
  'audioldm2': 'https://api-inference.huggingface.co/models/cvssp/audioldm2-music'
}

console.log(`
┌────────────────────────────────────────────────┐
│  🎵 Meta MusicGen - Leapcell Edition        │
│  🚀 Platform: Leapcell Serverless            │
│  ⚙️  Runtime: Node.js ${process.version}               │
└────────────────────────────────────────────────┘
`)

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    platform: 'Leapcell',
    runtime: 'Node.js',
    version: process.version,
    models: Object.keys(MODELS),
    apiKeyConfigured: !!HUGGINGFACE_API_KEY
  })
})

// 音樂生成 API
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, model = 'musicgen-medium' } = req.body

    if (!prompt) {
      return res.status(400).json({ error: '請輸入描述詞 (Prompt)' })
    }

    if (!HUGGINGFACE_API_KEY) {
      return res.status(500).json({ 
        error: '未配置 HUGGINGFACE_API_KEY',
        hint: '請在 Leapcell Dashboard 設置環境變量'
      })
    }

    const modelUrl = MODELS[model] || MODELS['musicgen-medium']
    
    console.log(`[生成開始] Model: ${model}, Prompt: ${prompt.substring(0, 50)}...`)

    // 調用 Hugging Face API
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 256,
          do_sample: true,
          temperature: 0.7
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      
      // 處理模型冷啟動
      if (errorText.includes('loading')) {
        console.log('[模型加載] 模型正在冷啟動中...')
        return res.status(503).json({ 
          error: '模型正在冷啟動中，請過 20 秒後重試', 
          isLoading: true 
        })
      }
      
      throw new Error(`HF API Error: ${response.status} - ${errorText}`)
    }

    // 獲取音頻數據
    const audioBuffer = await response.buffer()
    
    console.log(`[生成完成] 文件大小: ${(audioBuffer.length / 1024).toFixed(2)} KB`)
    
    // 返回音頻文件
    res.set({
      'Content-Type': 'audio/flac',
      'Content-Disposition': `attachment; filename="music_${Date.now()}.flac"`,
      'Content-Length': audioBuffer.length
    })
    res.send(audioBuffer)

  } catch (error) {
    console.error('[生成錯誤]', error.message)
    res.status(500).json({ 
      error: '生成失敗', 
      message: error.message 
    })
  }
})

// 接口文檔
app.get('/api', (req, res) => {
  res.json({
    name: 'Meta MusicGen API',
    version: '1.0.0',
    platform: 'Leapcell',
    endpoints: [
      {
        path: '/api/generate',
        method: 'POST',
        description: '生成音樂',
        parameters: {
          prompt: '音樂描述 (required)',
          model: 'musicgen-small | musicgen-medium | musicgen-large (optional)'
        }
      },
      {
        path: '/health',
        method: 'GET',
        description: '健康檢查'
      }
    ]
  })
})

// 404 處理
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path 
  })
})

// 啟動服務器
app.listen(PORT, () => {
  console.log(`✅ 服務器運行中: http://localhost:${PORT}`)
  console.log(`✅ API 文檔: http://localhost:${PORT}/api`)
  console.log(`✅ 健康檢查: http://localhost:${PORT}/health`)
  console.log(`✅ API Key: ${HUGGINGFACE_API_KEY ? '已配置 ✓' : '未配置 ✗'}\n`)
})