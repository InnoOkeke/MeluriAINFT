# Local Stable Diffusion API

No watermarks, completely free, runs on your machine!

## Installation

### Option 1: With GPU (NVIDIA CUDA)

```bash
# Install Python 3.10 or 3.11
# Install CUDA Toolkit 11.8 or 12.1

cd stable-diffusion-api
pip install -r requirements.txt
```

### Option 2: CPU Only (Slower but works)

```bash
cd stable-diffusion-api
pip install -r requirements.txt
```

## Running the API

```bash
python app.py
```

The API will start on `http://localhost:5000`

First run will download the model (~4GB), subsequent runs are instant.

## Usage

### Test the API

```bash
curl http://localhost:5000/health
```

### Generate an image

```bash
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a beautiful sunset over mountains"}' \
  --output image.png
```

## Frontend Integration

The frontend is already configured to use this local API!

Just make sure the API is running before generating images.

## Performance

- **GPU (NVIDIA)**: ~3-5 seconds per image
- **CPU**: ~30-60 seconds per image

## Troubleshooting

### Out of Memory

Edit `app.py` and change:
```python
width=512,
height=512
```
to:
```python
width=256,
height=256
```

### Slow Generation

Reduce inference steps in `app.py`:
```python
num_inference_steps=20,  # Faster but lower quality
```

## Alternative: Use Hugging Face API

If you don't want to run locally, get a free Hugging Face API token:

1. Go to https://huggingface.co/settings/tokens
2. Create a new token
3. Add to frontend/config.js:
```javascript
HUGGINGFACE_API_KEY: 'your_token_here'
```
