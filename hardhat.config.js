require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-solhint");
require("@nomicfoundation/hardhat-verify");
require('hardhat-deploy');
require("dotenv").config();
require("hardhat-gas-reporter");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      { version: "0.6.0" },

      { version: "0.8.0" }, 
      { version: "0.8.8" }, 
    ]
  },

  defaultNetwork: "hardhat",
  networks:{
    sepolia:{
      url: process.env.RPC_URL,
      accounts:[process.env.WALLET_KEY],
      chainId: 11155111,
      blockConfirmations:6,
    }
  },
  etherscan:{
    apiKey: process.env.ETHERSCAN_API,
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  },
  gasReporter: {
    enabled:true,
    outputFile:"gasReporter.txt",
    noColors:true,
    currency: 'USD',
    token:"MATIC",
    // L1: "ethereum",
    coinmarketcap: process.env.COIN_API,
  }
};