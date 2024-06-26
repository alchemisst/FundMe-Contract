const {getNamedAccounts, ethers} = require("hardhat");


const main = async () => {
    const {deployer} = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe",deployer);
    console.log("Fetched Contract......")
    const transactionResponse = await fundMe.fund({value: ethers.parseEther("0.1")}) 
    await transactionResponse.wait(1);
    console.log("Funded!");


};

main().then(()=> process.exit(0))
.catch((error)=>{
    console.error(error)
    process.exit(1);
})