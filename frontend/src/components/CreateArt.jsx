import { useState } from 'react'
import { CONFIG } from '../config'

export default function CreateArt({ generatedImage, setGeneratedImage, showStatus }) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadMode, setUploadMode] = useState(false)

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

      // Try multiple AI services in order of quality
      const services = [
        { name: 'Lexica', fn: () => generateWithLexica(prompt) },
        { name: 'Craiyon', fn: () => generateWithCraiyon(prompt) },
        { name: 'Local API', fn: () => generateWithLocalAPI(prompt) },
      ]

      // Try each service
      for (const service of services) {
        if (!imageGenerated) {
          try {
            imageUrl = await service.fn()
            imageGenerated = true
            console.log(`✅ Generated with ${service.name}`)
            break
          } catch (e) {
            console.log(`${service.name} failed, trying next...`)
          }
        }
      }

      // Fallback to Pollinations (always works)
      if (!imageGenerated) {
        const enhancedPrompt = `${prompt}, high quality, detailed, professional, 4k, masterpiece`
        const encodedPrompt = encodeURIComponent(enhancedPrompt)
        imageUrl = `${CONFIG.AI_IMAGE_APIS.pollinations}${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}&nologo=true&enhance=true`
        imageGenerated = true
        console.log('✅ Generated with Pollinations AI')
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

  const generateWithLexica = async (prompt) => {
    // Lexica Aperture - Art-focused AI (no API key needed)
    const encodedPrompt = encodeURIComponent(prompt)
    // Use Lexica's image generation endpoint
    const imageUrl = `https://lexica.art/api/v1/search?q=${encodedPrompt}`
    
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error('Lexica API failed')
    
    const data = await response.json()
    if (!data.images || data.images.length === 0) {
      throw new Error('No images found')
    }
    
    // Return the first high-quality image
    return data.images[0].src
  }

  const generateWithCraiyon = async (prompt) => {
    // Craiyon (DALL-E mini) - Free, no API key
    const response = await fetch('https://backend.craiyon.com/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        version: 'v3',
        token: null
      })
    })
    
    if (!response.ok) throw new Error('Craiyon API failed')
    
    const data = await response.json()
    
    // Craiyon returns base64 images
    if (!data.images || data.images.length === 0) {
      throw new Error('No images generated')
    }
    
    // Convert base64 to data URL
    return `data:image/jpeg;base64,${data.images[0]}`
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showStatus('Please upload an image file', 'error')
      return
    }

    setLoading(true)
    showStatus('📤 Uploading image...', 'info')

    const reader = new FileReader()
    reader.onload = (e) => {
      setGeneratedImage(e.target.result)
      setLoading(false)
      showStatus('✨ Image uploaded successfully!', 'success')
      setTimeout(() => {
        document.getElementById('mintSection')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
    reader.onerror = () => {
      setLoading(false)
      showStatus('Failed to upload image', 'error')
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="card create-section">
      <div className="step-header">
        <span className="step-number">1</span>
        <h2>🎨 Create Your NFT</h2>
      </div>

      {/* Mode Toggle */}
      <div className="mode-toggle" style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={() => setUploadMode(false)}
          className={`btn ${!uploadMode ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1 }}
        >
          ✨ Generate AI Art
        </button>
        <button 
          onClick={() => setUploadMode(true)}
          className={`btn ${uploadMode ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1 }}
        >
          📤 Upload Image
        </button>
      </div>
      
      {!uploadMode ? (
        // AI Generation Mode
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
      ) : (
        // Upload Mode
        <div className="upload-section">
          <div className="form-group">
            <label htmlFor="imageUpload">Upload Your Image:</label>
            <input 
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
            />
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#888' }}>
              Select an image file to use as your NFT
            </p>
          </div>
        </div>
      )}

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
