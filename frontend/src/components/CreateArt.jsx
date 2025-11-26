import { useState } from 'react'
import { CONFIG } from '../config'

export default function CreateArt({ generatedImage, setGeneratedImage, showStatus }) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)

  const generateAIArt = async () => {
    if (!prompt.trim()) {
      showStatus('Please enter a description for your NFT', 'error')
      return
    }

    setLoading(true)
    showStatus('🎨 Generating your AI art...', 'info')

    try {
      let imageGenerated = false
      let imageUrl = ''

      // Try Pollinations first (no CORS issues, always works)
      try {
        const enhancedPrompt = `${prompt}, high quality, detailed, professional, 4k, masterpiece`
        const encodedPrompt = encodeURIComponent(enhancedPrompt)
        imageUrl = `${CONFIG.AI_IMAGE_APIS.pollinations}${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}&nologo=true&enhance=true`
        imageGenerated = true
        console.log('✅ Generated with Pollinations AI')
      } catch (e) {
        console.log('Pollinations failed, trying alternatives...')
      }

      // Fallback to local API if available
      if (!imageGenerated) {
        try {
          imageUrl = await generateWithLocalAPI(prompt)
          imageGenerated = true
          console.log('✅ Generated with local Stable Diffusion')
        } catch (e) {
          console.log('Local API not available')
        }
      }

      // Last resort: try a different free API
      if (!imageGenerated) {
        try {
          // Use a CORS-friendly alternative
          const encodedPrompt = encodeURIComponent(prompt)
          imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}`
          imageGenerated = true
          console.log('✅ Generated with fallback API')
        } catch (e) {
          console.error('All AI APIs failed:', e)
          throw new Error('Unable to generate image. Please try again.')
        }
      }

      // Preload image
      const img = new Image()
      img.onload = () => {
        setGeneratedImage(imageUrl)
        showStatus('✨ AI art generated successfully!', 'success')
        setTimeout(() => {
          document.getElementById('mintSection')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
      img.onerror = () => {
        showStatus('Failed to generate image. Please try again.', 'error')
      }
      img.src = imageUrl

    } catch (error) {
      console.error('Error generating AI art:', error)
      showStatus('Failed to generate AI art', 'error')
    } finally {
      setLoading(false)
    }
  }

  const generateWithLocalAPI = async (prompt) => {
    const response = await fetch(CONFIG.AI_IMAGE_APIS.local, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
    
    if (!response.ok) throw new Error('Local API not available')
    
    const data = await response.json()
    return data.image
  }

  const generateWithHuggingFace = async (prompt) => {
    // Using Hugging Face Inference API
    const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        options: {
          wait_for_model: true,
          use_cache: false
        }
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Hugging Face error:', error)
      throw new Error('Hugging Face API failed')
    }
    
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  }

  return (
    <section className="card create-section">
      <div className="step-header">
        <span className="step-number">1</span>
        <h2>🎨 Create Your AI Art</h2>
      </div>
      
      <div className="prompt-section">
        <div className="form-group">
          <label htmlFor="aiPrompt">Describe your NFT:</label>
          <textarea 
            id="aiPrompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., A futuristic cyberpunk city at night with neon lights..."
            rows="3"
          />
          <div className="prompt-suggestions">
            <small>Try these:</small>
            <div className="sample-prompts">
              {CONFIG.SAMPLE_PROMPTS.map((sample, i) => (
                <button
                  key={i}
                  className="sample-prompt-btn"
                  onClick={() => setPrompt(sample)}
                  title={sample}
                >
                  {sample.substring(0, 30)}...
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <button 
          onClick={generateAIArt}
          className="btn btn-generate"
          disabled={loading}
        >
          {loading ? (
            <>🎨 Creating...</>
          ) : generatedImage ? (
            <>🔄 Regenerate</>
          ) : (
            <>✨ Generate AI Art</>
          )}
        </button>
      </div>

      {loading && (
        <div className="generating-loader">
          <div className="loader-animation">
            <div className="loader-circle"></div>
            <div className="loader-circle"></div>
            <div className="loader-circle"></div>
          </div>
          <h3>🎨 Generating Your NFT...</h3>
          <p>meluri AI is creating something amazing for you!</p>
        </div>
      )}

      {generatedImage && !loading && (
        <div className="image-preview">
          <h3>✨ Your AI Generated NFT</h3>
          <div className="preview-container">
            <img src={generatedImage} alt="Generated NFT" />
          </div>
        </div>
      )}
    </section>
  )
}
