@echo off
echo Setting up universal contract on all EVM chains...

echo.
echo === Sepolia ===
call npx hardhat run scripts/setup_evm_connections.js --network sepolia

echo.
echo === Polygon Amoy ===
call npx hardhat run scripts/setup_evm_connections.js --network polygon_amoy

echo.
echo === BSC Testnet ===
call npx hardhat run scripts/setup_evm_connections.js --network bsc_testnet

echo.
echo === Kaia Testnet ===
call npx hardhat run scripts/setup_evm_connections.js --network kaia_testnet

echo.
echo === Avalanche Fuji ===
call npx hardhat run scripts/setup_evm_connections.js --network avalanche_fuji

echo.
echo === Arbitrum Sepolia ===
call npx hardhat run scripts/setup_evm_connections.js --network arbitrum_sepolia

echo.
echo ✅ All EVM chains configured!
pause
