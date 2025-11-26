// Simple wallet connection without Web3Modal
// Works with MetaMask and any injected wallet

const CONTRACT_ABI = [
    "function mintAINFT(address to, string memory tokenURI) public returns (uint256)",
    "function sendNFTCrossChain(uint256 tokenId, bytes memory receiver, uint256 destinationChainId) external payable",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function tokenURI(uint256 tokenId) public view returns (string memory)",
    "function nftMetadata(uint256 tokenId) public view returns (string memory)",
    "function totalSupply() public view returns (uint256)",
    "event NFTMinted(uint256 indexed tokenId, address indexed owner, string tokenURI)"
];

let provider;
let signer;
let userAddress;
let selectedChain = '7001';
let generatedImageUrl = '';
let currentNFT = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadSamplePrompts();
    loadChainSelectors();
    checkIfWalletIsConnected();
});

function setupEventListeners() {
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    document.getElementById('disconnectBtn')?.addEventListener('click', disconnectWallet);
    document.getElementById('generateBtn').addEventListener('click', generateAIArt);
    document.getElementById('regenerateBtn')?.addEventListener('click', generateAIArt);
    document.getElementById('mintBtn').addEventListener('click', mintNFT);
    document.getElementById('mintAnotherBtn')?.addEventListener('click', mintAnother);
    document.getElementById('transferBtn')?.addEventListener('click', openTransferModal);
    document.getElementById('confirmTransferBtn')?.addEventListener('click', confirmTransfer);
    document.getElementById('viewExplorerBtn')?.addEventListener('click', viewOnExplorer);
    document.getElementById('loadNFTsBtn')?.addEventListener('click', loadMyNFTs);
    
    document.querySelector('.modal-close')?.addEventListener('click', closeTransferModal);
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeTransferModal();
        }
    });
}

async function checkIfWalletIsConnected() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                userAddress = await signer.getAddress();
                updateWalletUI();
                subscribeToProviderEvents();
            }
        } catch (error) {
            console.error('Error checking wallet:', error);
        }
    }
}

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        showStatus('Please install MetaMask or another Web3 wallet', 'error');
        setTimeout(() => {
            window.open('https://metamask.io/download/', '_blank');
        }, 2000);
        return;
    }

    try {
        showStatus('Connecting to wallet...', 'info');
        
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        if (accounts.length === 0) {
            showStatus('No accounts found', 'error');
            return;
        }

        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        updateWalletUI();
        subscribeToProviderEvents();
        showStatus('Wallet connected successfully!', 'success');
        
    } catch (error) {
        console.error('Error connecting wallet:', error);
        
        if (error.code === 4001) {
            showStatus('Connection rejected by user', 'info');
        } else if (error.code === -32002) {
            showStatus('Please check MetaMask - connection request pending', 'info');
        } else {
            showStatus('Failed to connect wallet: ' + error.message, 'error');
        }
    }
}

function subscribeToProviderEvents() {
    if (!window.ethereum) return;

    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
    window.ethereum.removeAllListeners('disconnect');

    window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length === 0) {
            disconnectWallet();
        } else {
            userAddress = accounts[0];
            updateWalletUI();
            showStatus('Account changed', 'info');
        }
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });

    window.ethereum.on('disconnect', () => {
        disconnectWallet();
    });
}

function updateWalletUI() {
    document.getElementById('connectWallet').classList.add('hidden');
    document.getElementById('walletInfo').classList.remove('hidden');
    document.getElementById('walletAddress').textContent = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
}

function disconnectWallet() {
    provider = null;
    signer = null;
    userAddress = null;
    
    document.getElementById('connectWallet').classList.remove('hidden');
    document.getElementById('walletInfo').classList.add('hidden');
    showStatus('Wallet disconnected', 'info');
}

function loadSamplePrompts() {
    const container = document.getElementById('samplePrompts');
    CONFIG.SAMPLE_PROMPTS.forEach(prompt => {
        const btn = document.createElement('button');
        btn.className = 'sample-prompt-btn';
        btn.textContent = prompt.substring(0, 30) + '...';
        btn.title = prompt;
        btn.onclick = () => {
            document.getElementById('aiPrompt').value = prompt;
        };
        container.appendChild(btn);
    });
}

function loadChainSelectors() {
    const mintSelector = document.getElementById('chainSelector');
    const transferSelector = document.getElementById('transferChainSelector');
    
    Object.entries(CONFIG.MINT_CHAINS).forEach(([chainId, chain]) => {
        const mintCard = createChainCard(chainId, chain, true);
        mintSelector.appendChild(mintCard);
        
        const transferCard = createChainCard(chainId, chain, false);
        transferSelector.appendChild(transferCard);
    });
}

function createChainCard(chainId, chain, isMintSelector) {
    const card = document.createElement('div');
    card.className = 'chain-card';
    if (isMintSelector && chainId === '7001') {
        card.classList.add('selected');
    }
    
    card.innerHTML = `
        <div class="chain-icon">${chain.icon}</div>
        <div class="chain-name">${chain.name}</div>
    `;
    
    card.onclick = () => {
        const parent = card.parentElement;
        parent.querySelectorAll('.chain-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        if (isMintSelector) {
            selectedChain = chainId;
        }
    };
    
    return card;
}

async function generateAIArt() {
    const prompt = document.getElementById('aiPrompt').value.trim();
    
    if (!prompt) {
        showStatus('Please enter a description for your NFT', 'error');
        return;
    }

    const generateBtn = document.getElementById('generateBtn');
    const regenerateBtn = document.getElementById('regenerateBtn');
    const activeBtn = generateBtn.style.display !== 'none' ? generateBtn : regenerateBtn;
    
    activeBtn.querySelector('.btn-text').classList.add('hidden');
    activeBtn.querySelector('.btn-loading').classList.remove('hidden');
    activeBtn.disabled = true;
    
    document.getElementById('generatingLoader').classList.remove('hidden');
    document.getElementById('imagePreview').classList.add('hidden');

    try {
        showStatus('🎨 Generating your AI art...', 'info');
        
        let imageGenerated = false;
        
        // Try Local Stable Diffusion
        try {
            generatedImageUrl = await generateWithLocalAPI(prompt);
            imageGenerated = true;
            console.log('✅ Generated with local Stable Diffusion');
        } catch (e) {
            console.log('Local API not available, trying Hugging Face...');
        }
        
        // Try Hugging Face
        if (!imageGenerated) {
            try {
                generatedImageUrl = await generateWithHuggingFace(prompt);
                imageGenerated = true;
                console.log('✅ Generated with Hugging Face');
            } catch (e) {
                console.log('Hugging Face failed, trying fallback...');
            }
        }
        
        // Fallback to Pollinations
        if (!imageGenerated) {
            const enhancedPrompt = `${prompt}, high quality, detailed, professional, 4k`;
            const encodedPrompt = encodeURIComponent(enhancedPrompt);
            generatedImageUrl = `${CONFIG.AI_IMAGE_APIS.pollinations}${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}&nologo=true&enhance=true`;
            imageGenerated = true;
            console.log('✅ Generated with Pollinations');
        }
        
        const img = new Image();
        img.onload = () => {
            document.getElementById('generatingLoader').classList.add('hidden');
            document.getElementById('generatedImage').src = generatedImageUrl;
            document.getElementById('imagePreview').classList.remove('hidden');
            document.getElementById('mintBtn').disabled = false;
            document.getElementById('mintSection').scrollIntoView({ behavior: 'smooth' });
            showStatus('✨ AI art generated successfully!', 'success');
            
            if (!document.getElementById('nftName').value) {
                const name = prompt.substring(0, 50);
                document.getElementById('nftName').value = name;
            }
        };
        img.onerror = () => {
            document.getElementById('generatingLoader').classList.add('hidden');
            showStatus('Failed to generate image. Please try again.', 'error');
        };
        img.src = generatedImageUrl;
        
    } catch (error) {
        console.error('Error generating AI art:', error);
        document.getElementById('generatingLoader').classList.add('hidden');
        showStatus('Failed to generate AI art', 'error');
    } finally {
        activeBtn.querySelector('.btn-text').classList.remove('hidden');
        activeBtn.querySelector('.btn-loading').classList.add('hidden');
        activeBtn.disabled = false;
    }
}

async function generateWithLocalAPI(prompt) {
    const response = await fetch(CONFIG.AI_IMAGE_APIS.local, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) throw new Error('Local API not available');
    
    const data = await response.json();
    return data.image;
}

async function generateWithHuggingFace(prompt) {
    const response = await fetch(CONFIG.AI_IMAGE_APIS.huggingface, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            inputs: prompt,
            options: { wait_for_model: true }
        })
    });
    
    if (!response.ok) throw new Error('Hugging Face API failed');
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

async function mintNFT() {
    if (!signer) {
        showStatus('Please connect wallet first', 'error');
        return;
    }

    if (!generatedImageUrl) {
        showStatus('Please generate an image first', 'error');
        return;
    }

    const nftName = document.getElementById('nftName').value.trim();
    const nftDescription = document.getElementById('nftDescription').value.trim();
    const prompt = document.getElementById('aiPrompt').value.trim();

    if (!nftName) {
        showStatus('Please enter an NFT name', 'error');
        return;
    }

    const mintBtn = document.getElementById('mintBtn');
    mintBtn.querySelector('.btn-text').classList.add('hidden');
    mintBtn.querySelector('.btn-loading').classList.remove('hidden');
    mintBtn.disabled = true;

    try {
        await switchToChain(selectedChain);

        const metadata = {
            name: nftName,
            description: nftDescription || prompt,
            image: generatedImageUrl,
            attributes: [
                { trait_type: 'AI Generated', value: 'Yes' },
                { trait_type: 'Prompt', value: prompt },
                { trait_type: 'Created', value: new Date().toISOString() }
            ]
        };

        const metadataJson = JSON.stringify(metadata);
        const metadataUri = `data:application/json;base64,${btoa(metadataJson)}`;

        showStatus('Preparing to mint...', 'info');

        const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        showStatus('Minting NFT... Please confirm in wallet', 'info');
        const tx = await contract.mintAINFT(userAddress, metadataUri);
        
        showStatus('Transaction submitted. Waiting for confirmation...', 'info');
        const receipt = await tx.wait();
        
        const event = receipt.events?.find(e => e.event === 'NFTMinted');
        const tokenId = event?.args?.tokenId?.toString();
        
        currentNFT = {
            tokenId,
            name: nftName,
            image: generatedImageUrl,
            chain: selectedChain,
            chainName: CONFIG.MINT_CHAINS[selectedChain].name,
            owner: userAddress,
            metadata: metadataUri
        };

        showSuccessSection();
        showStatus(`NFT minted successfully! Token ID: ${tokenId}`, 'success');
        
    } catch (error) {
        console.error('Error minting NFT:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        mintBtn.querySelector('.btn-text').classList.remove('hidden');
        mintBtn.querySelector('.btn-loading').classList.add('hidden');
        mintBtn.disabled = false;
    }
}

async function switchToChain(chainId) {
    const chain = CONFIG.MINT_CHAINS[chainId];
    
    if (!window.ethereum) {
        throw new Error('No wallet connected');
    }
    
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chain.chainId }],
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: chain.chainId,
                        chainName: chain.name,
                        nativeCurrency: chain.nativeCurrency,
                        rpcUrls: [chain.rpcUrl],
                        blockExplorerUrls: [chain.explorer]
                    }],
                });
            } catch (addError) {
                throw new Error(`Failed to add ${chain.name} network`);
            }
        } else {
            throw switchError;
        }
    }
    
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
}

function showSuccessSection() {
    document.getElementById('mintedImage').src = currentNFT.image;
    document.getElementById('mintedName').textContent = currentNFT.name;
    document.getElementById('mintedTokenId').textContent = currentNFT.tokenId;
    document.getElementById('mintedChain').textContent = currentNFT.chainName;
    document.getElementById('mintedOwner').textContent = `${currentNFT.owner.slice(0, 6)}...${currentNFT.owner.slice(-4)}`;
    
    document.getElementById('successSection').classList.remove('hidden');
    document.getElementById('successSection').scrollIntoView({ behavior: 'smooth' });
}

function mintAnother() {
    document.getElementById('aiPrompt').value = '';
    document.getElementById('nftName').value = '';
    document.getElementById('nftDescription').value = '';
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('successSection').classList.add('hidden');
    document.getElementById('mintBtn').disabled = true;
    generatedImageUrl = '';
    currentNFT = null;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openTransferModal() {
    document.getElementById('transferModal').classList.remove('hidden');
}

function closeTransferModal() {
    document.getElementById('transferModal').classList.add('hidden');
}

async function confirmTransfer() {
    if (!currentNFT) {
        showStatus('No NFT to transfer', 'error');
        return;
    }

    const transferChainCard = document.querySelector('#transferChainSelector .chain-card.selected');
    if (!transferChainCard) {
        showStatus('Please select a destination chain', 'error');
        return;
    }

    const destinationChainId = Object.keys(CONFIG.MINT_CHAINS).find((id, index) => {
        return document.querySelectorAll('#transferChainSelector .chain-card')[index] === transferChainCard;
    });

    let receiverAddress = document.getElementById('transferReceiver').value.trim();
    if (!receiverAddress) {
        receiverAddress = userAddress;
    }

    const confirmBtn = document.getElementById('confirmTransferBtn');
    confirmBtn.querySelector('.btn-text').classList.add('hidden');
    confirmBtn.querySelector('.btn-loading').classList.remove('hidden');
    confirmBtn.disabled = true;

    try {
        await switchToChain(currentNFT.chain);

        const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const receiverBytes = ethers.utils.solidityPack(['address'], [receiverAddress]);

        showStatus('Initiating cross-chain transfer...', 'info');
        const tx = await contract.sendNFTCrossChain(
            currentNFT.tokenId,
            receiverBytes,
            destinationChainId,
            { 
                value: ethers.utils.parseEther('0.1'),
                gasLimit: 500000
            }
        );

        showStatus('Transaction submitted. Waiting for confirmation...', 'info');
        await tx.wait();

        closeTransferModal();
        showStatus('NFT transfer initiated! It will arrive in 2-5 minutes.', 'success');
        
        currentNFT = null;
        
    } catch (error) {
        console.error('Error transferring NFT:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        confirmBtn.querySelector('.btn-text').classList.remove('hidden');
        confirmBtn.querySelector('.btn-loading').classList.add('hidden');
        confirmBtn.disabled = false;
    }
}

function viewOnExplorer() {
    if (currentNFT) {
        const explorer = CONFIG.MINT_CHAINS[currentNFT.chain].explorer;
        window.open(`${explorer}/address/${CONFIG.CONTRACT_ADDRESS}`, '_blank');
    }
}

async function loadMyNFTs() {
    if (!signer) {
        showStatus('Please connect wallet first', 'error');
        return;
    }

    showStatus('Loading your NFTs...', 'info');
    
    try {
        const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const totalSupply = await contract.totalSupply();
        
        const gallery = document.getElementById('nftGallery');
        gallery.innerHTML = '';
        gallery.classList.remove('hidden');
        
        let foundNFTs = 0;
        
        for (let i = 1; i <= totalSupply; i++) {
            try {
                const owner = await contract.ownerOf(i);
                if (owner.toLowerCase() === userAddress.toLowerCase()) {
                    const tokenURI = await contract.tokenURI(i);
                    const nftCard = await createNFTCard(i, tokenURI);
                    gallery.appendChild(nftCard);
                    foundNFTs++;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (foundNFTs === 0) {
            gallery.innerHTML = '<p class="no-nfts">You don\'t own any NFTs yet. Mint your first one above!</p>';
        } else {
            showStatus(`Found ${foundNFTs} NFT(s)`, 'success');
        }
        
    } catch (error) {
        console.error('Error loading NFTs:', error);
        showStatus('Error loading NFTs', 'error');
    }
}

async function createNFTCard(tokenId, tokenURI) {
    const card = document.createElement('div');
    card.className = 'nft-gallery-card';
    
    try {
        let metadata;
        if (tokenURI.startsWith('data:application/json')) {
            const base64Data = tokenURI.split(',')[1];
            metadata = JSON.parse(atob(base64Data));
        } else {
            const response = await fetch(tokenURI);
            metadata = await response.json();
        }
        
        card.innerHTML = `
            <img src="${metadata.image}" alt="${metadata.name}" />
            <div class="nft-gallery-info">
                <h4>${metadata.name}</h4>
                <p>Token ID: ${tokenId}</p>
            </div>
        `;
    } catch (e) {
        card.innerHTML = `
            <div class="nft-gallery-info">
                <h4>NFT #${tokenId}</h4>
                <p>Unable to load metadata</p>
            </div>
        `;
    }
    
    return card;
}

function showStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.classList.remove('hidden');
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusEl.classList.add('hidden');
        }, 5000);
    }
}
