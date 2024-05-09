  require('dotenv').config();

  const { network } = require("hardhat");

  const {networkConfig, developmentChains} = require("../helper-hardhat-network");
  const { verify } = require("../utils/verify");


  module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre;

    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress ;
    if(developmentChains.includes(network.name)){
      const ethUsdAggregator = await deployments.get("MockV3Aggregator")
      ethUsdPriceFeedAddress = ethUsdAggregator.address;
    }else{
      ethUsdPriceFeedAddress= networkConfig[chainId]["ethUsdPriceFeed"];
    }
    const currentArgs = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMe",{
      from: deployer,
      args: [ethUsdPriceFeedAddress],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("XX--------SECOND IF--------------------XX")
    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API){
      await verify(fundMe.address,currentArgs)
    }
    log("XX----------------------------------------------------XX")

  };

  module.exports.tags = ["all" , "fundMe"]