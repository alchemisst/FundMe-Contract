const { getNamedAccounts, ethers } = require("hardhat");

const main = async ()=>{
    const {deployer} = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe",deployer);

    const transactionResponse = await fundMe.withdraw();
    await transactionResponse.wait(1);
    console.log("Withdrawn!")

}

main().then(()=> process.exit(0))
.catch((error)=>{
    console.error(error)
    process.exit(1);
})