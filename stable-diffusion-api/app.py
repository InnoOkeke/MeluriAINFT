"""
Simple Stable Diffusion API Server
No watermarks, runs locally, completely free
"""

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from diffusers import StableDiffusionPipeline
import torch
from io import BytesIO
import base64
from PIL import Image

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Initialize Stable Diffusion model
print("Loading Stable Diffusion model...")
model_id = "runwayml/stable-diffusion-v1-5"  # Smaller, faster model
device = "cuda" if torch.cuda.is_available() else "cpu"

pipe = StableDiffusionPipeline.from_pretrained(
    model_id,
    torch_dtype=torch.float16 if device == "cuda" else torch.float32,
    safety_checker=None  # Disable for faster generation
)
pipe = pipe.to(device)

# Enable memory optimizations
if device == "cuda":
    pipe.enable_attention_slicing()
    pipe.enable_vae_slicing()

print(f"Model loaded on {device}!")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "device": device})

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400
        
        # Enhance prompt for better quality
        enhanced_prompt = f"{prompt}, high quality, detailed, professional, 4k, masterpiece"
        
        print(f"Generating image for: {prompt}")
        
        # Generate image
        with torch.no_grad():
            image = pipe(
                enhanced_prompt,
                num_inference_steps=30,  # Balance between speed and quality
                guidance_scale=7.5,
                width=512,
                height=512
            ).images[0]
        
        # Convert to bytes
        img_io = BytesIO()
        image.save(img_io, 'PNG', quality=95)
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png')
        
    except Exception as e:
        print(f"Error generating image: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-base64', methods=['POST'])
def generate_base64():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400
        
        enhanced_prompt = f"{prompt}, high quality, detailed, professional, 4k, masterpiece"
        
        print(f"Generating image for: {prompt}")
        
        with torch.no_grad():
            image = pipe(
                enhanced_prompt,
                num_inference_steps=30,
                guidance_scale=7.5,
                width=512,
                height=512
            ).images[0]
        
        # Convert to base64
        img_io = BytesIO()
        image.save(img_io, 'PNG', quality=95)
        img_io.seek(0)
        img_base64 = base64.b64encode(img_io.getvalue()).decode()
        
        return jsonify({
            "image": f"data:image/png;base64,{img_base64}",
            "prompt": prompt
        })
        
    except Exception as e:
        print(f"Error generating image: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
