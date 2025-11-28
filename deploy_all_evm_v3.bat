@echo off
echo Deploying V3 EVM contracts to all chains...

echo.
echo === Sepolia ===
call npx hardhat run scripts/deploy_gateway_evm_v3.js --network sepolia

echo.
echo === Polygon Amoy ===
call npx hardhat run scripts/deploy_gateway_evm_v3.js --network polygon_amoy

echo.
echo === BSC Testnet ===
call npx hardhat run scripts/deploy_gateway_evm_v3.js --network bsc_testnet

echo.
echo === Kaia Testnet ===
call npx hardhat run scripts/deploy_gateway_evm_v3.js --network kaia_testnet

echo.
echo === Avalanche Fuji ===
call npx hardhat run scripts/deploy_gateway_evm_v3.js --network avalanche_fuji

echo.
echo === Arbitrum Sepolia ===
call npx hardhat run scripts/deploy_gateway_evm_v3.js --network arbitrum_sepolia

echo.
echo ✅ All V3 EVM contracts deployed!
echo.
echo Next steps:
echo 1. Update .env with new contract addresses
echo 2. Run setup_connections_v3.js to connect them to ZetaChain V3
echo 3. Update frontend config.js with new addresses
pause
