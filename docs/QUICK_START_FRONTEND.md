# Quick Start - Frontend Setup

## Issue: Webpage Shows Only Headers, No Body Content

If you're seeing only headers without body content, you're likely opening the wrong HTML file. The root `index.html` is a redirect page. You need to run the React development server.

## Solution: Run the React App Properly

### Windows
```bash
start-react.bat
```

### Linux/Mac
```bash
cd frontend
npm install
npm run dev
```

### Manual Steps
1. Open terminal/command prompt
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies (first time only):
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser to: `http://localhost:5173`

## What's Happening?

- The root `index.html` is just a redirect page for GitHub Pages
- The actual React app is in the `frontend` directory
- Vite (the build tool) serves the React app at `http://localhost:5173`
- The React app loads components dynamically, which is why you need the dev server

## Verify It's Working

When the app loads correctly, you should see:
- ✅ "Meluri AI NFT" header
- ✅ "Connect Wallet" button
- ✅ Network switcher dropdown
- ✅ Navigation menu (after connecting wallet)
- ✅ Mint page with AI image generation

## Common Issues

### Port Already in Use
If port 5173 is busy:
```bash
# Kill the process using the port (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3000
```

### Module Not Found Errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### React Not Loading
Check browser console (F12) for errors. Common fixes:
- Clear browser cache
- Disable browser extensions
- Try incognito/private mode

## Next Steps

After the frontend is running:
1. Connect your MetaMask wallet
2. Make sure you have testnet tokens
3. Switch to a supported network
4. Start minting AI NFTs!
