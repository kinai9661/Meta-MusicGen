/**
 * Meta-MusicGen on Cloudflare Workers
 * 完全免費的無限音樂生成器
 * GitHub: https://github.com/kinai9661/Meta-MusicGen
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// 配置常量
const CONFIG = {
  API_TOKEN_VAR: 'HUGGINGFACE_API_KEY',
  TIMEOUT: 60000 // 60秒超時
}

// 免費模型列表 (Meta MusicGen & Others)
const MODELS = {
  'musicgen-small': 'https://api-inference.huggingface.co/models/facebook/musicgen-small',
  'musicgen-medium': 'https://api-inference.huggingface.co/models/facebook/musicgen-medium',
  'musicgen-large': 'https://api-inference.huggingface.co/models/facebook/musicgen-large',
  'audioldm2': 'https://api-inference.huggingface.co/models/cvssp/audioldm2-music'
}

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // CORS 預檢
  if (request.method === 'OPTIONS') return handleCORS()

  // 路由處理
  if (path === '/' || path === '/index.html') {
    return handleUI() // 返回前端界面
  } else if (path === '/api/generate' && request.method === 'POST') {
    return handleGenerate(request) // 處理生成請求
  }

  return new Response('Not Found', { status: 404 })
}

// 處理生成請求
async function handleGenerate(request) {
  try {
    const body = await request.json()
    const { prompt, model = 'musicgen-medium', duration = 30 } = body

    if (!prompt) return jsonResponse({ error: '請輸入描述詞 (Prompt)' }, 400)

    // 獲取 API Key
    const apiKey = HUGGINGFACE_API_KEY || null
    if (!apiKey) return jsonResponse({ error: '未配置 HUGGINGFACE_API_KEY' }, 500)

    const modelUrl = MODELS[model] || MODELS['musicgen-medium']

    console.log(`[生成開始] Model: ${model}, Prompt: ${prompt}`)

    // 調用 Hugging Face API
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
      const err = await response.text()
      // 處理模型加載中的情況 (Cold Boot)
      if (err.includes('loading')) {
        return jsonResponse({ error: '模型正在冷啟動中，請過 20 秒後重試', isLoading: true }, 503)
      }
      throw new Error(`HF API Error: ${response.status} ${err}`)
    }

    // 返回音頻二進制流
    const audioBuffer = await response.arrayBuffer()
    
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/flac',
        'Content-Disposition': `attachment; filename="generated_${Date.now()}.flac"`,
        ...corsHeaders()
      }
    })

  } catch (error) {
    console.error(error)
    return jsonResponse({ error: error.message }, 500)
  }
}

// 前端 UI (單頁面應用)
function handleUI() {
  const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meta MusicGen - 免費無限音樂生成</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: linear-gradient(135deg, #1a1c2c 0%, #4a192c 100%); color: white; min-height: 100vh; }
    .glass { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); }
    .loader { border: 3px solid #f3f3f3; border-top: 3px solid #ec4899; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body class="flex items-center justify-center p-4">
  <div class="glass rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">Meta MusicGen</h1>
      <p class="text-gray-300 mt-2">完全免費 · 無限生成 · 類似 Vidnoz</p>
    </div>

    <div class="space-y-6">
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-300">音樂描述 (Prompt)</label>
        <textarea id="prompt" rows="3" class="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-pink-500 outline-none" placeholder="例如：一首輕快的日系 City Pop，包含合成器和放克貝斯..."></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">風格預設</label>
          <select id="style" class="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white" onchange="updatePrompt()">
            <option value="">自定義</option>
            <option value="lofi hip hop beats, chill, relaxing">Lofi Hip Hop</option>
            <option value="cinematic epic orchestral, trailer music">史詩電影感</option>
            <option value="cyberpunk electronic, synthwave, futuristic">賽博龐克</option>
            <option value="japanese city pop, 80s, funky">日系 City Pop</option>
            <option value="piano solo, emotional, sad">感人鋼琴曲</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">模型選擇</label>
          <select id="model" class="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white">
            <option value="musicgen-medium" selected>MusicGen Medium (推薦)</option>
            <option value="musicgen-small">MusicGen Small (快速)</option>
            <option value="musicgen-large">MusicGen Large (高質量)</option>
          </select>
        </div>
      </div>

      <button id="generateBtn" onclick="generate()" class="w-full bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-bold py-4 rounded-lg transition transform hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2">
        <span>✨ 開始生成音樂</span>
      </button>

      <div id="status" class="hidden p-4 rounded-lg bg-blue-500/20 text-blue-200 text-sm text-center"></div>

      <div id="result" class="hidden animate-fade-in">
        <div class="bg-gray-900/50 p-6 rounded-xl border border-gray-700 text-center">
          <h3 class="text-xl font-bold mb-4 text-pink-400">生成成功! 🎵</h3>
          <audio id="audioPlayer" controls class="w-full mb-4"></audio>
          <a id="downloadLink" class="inline-block px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm transition">⬇️ 下載音頻</a>
        </div>
      </div>
    </div>
  </div>

  <script>
    function updatePrompt() {
      const style = document.getElementById('style').value;
      if(style) document.getElementById('prompt').value = style;
    }

    async function generate() {
      const prompt = document.getElementById('prompt').value;
      const model = document.getElementById('model').value;
      const btn = document.getElementById('generateBtn');
      const status = document.getElementById('status');
      const result = document.getElementById('result');

      if(!prompt) return alert('請輸入描述!');

      // UI 狀態更新
      btn.disabled = true;
      btn.innerHTML = '<div class="loader"></div> 正在創作中... (約30秒)';
      status.classList.remove('hidden');
      status.innerText = '正在連接 AI 模型進行運算...';
      result.classList.add('hidden');

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ prompt, model })
        });

        if(!res.ok) {
          const data = await res.json();
          throw new Error(data.error || '生成失敗');
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        
        document.getElementById('audioPlayer').src = url;
        document.getElementById('downloadLink').href = url;
        document.getElementById('downloadLink').download = `musicgen_${Date.now()}.flac`;
        
        result.classList.remove('hidden');
        status.classList.add('hidden');

      } catch (err) {
        status.className = 'p-4 rounded-lg bg-red-500/20 text-red-200 text-sm text-center';
        status.innerText = '錯誤: ' + err.message;
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>✨ 再生成一首</span>';
      }
    }
  </script>
</body>
</html>
  `
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
}

// 輔助函數
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  })
}

function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
}