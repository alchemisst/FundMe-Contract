

    const { deployments, ethers, getNamedAccounts } = require("hardhat");
    const {developmentChains} = require("../../helper-hardhat-network")
    const { assert, expect } = require("chai")

    
!developmentChains.includes(network.name) ? describe.skip : describe("FundMe" , async function(){

        let fundMe;
        let deployer;
        let mockV3Aggregator;
        const sendValue = ethers.parseEther("1");
        
        beforeEach(async function(){
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"]);
        // Deploy FundMe contract with the MockV3Aggregator address
            fundMe = await ethers.getContract("FundMe", deployer);
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
            
        })

        describe("constructor", async () => {
            it("Sets the Aggregator addresses correctly", async function () {
                const response = await fundMe.s_priceFeed();
                const resolvedAddress = await mockV3Aggregator.target; 
                assert.equal(response, resolvedAddress);
            })

        })
    
        describe("fund", async function(){  
        
        
            it("fails when you don't send enough eth",async function(){
                await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
            })
            
            it("update the amount funded structure",async function(){
                await fundMe.fund({value:sendValue})

                const response = await fundMe.s_addressToAmountFunded(deployer)

                assert.equal(response.toString(),sendValue.toString())
            })

            it("checks the funders array", async function(){
                await fundMe.fund({value:sendValue});
                const funder = await fundMe.s_funders(0);
                assert.equal(funder,deployer);

            })
         

        })

        describe("withdraw",async function(){
            this.beforeEach(async ()=>{
                await fundMe.fund({value:sendValue})
            })

            it("withdraw from single founder", async ()=>{
                //arrange
                const add = await fundMe.address;
                console.log(add)
                const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                const startingDeployerBalance = await ethers.provider.getBalance(deployer);

                //act
                const transactionResponse = await fundMe.withdraw();
                const transactionReciept = await transactionResponse.wait(1);
                const {gasUsed , gasPrice} = transactionReciept;
                const gasCost = gasUsed * gasPrice;

                const endingBalance = await ethers.provider.getBalance(fundMe.target)
                const endingDeployerBalance = await ethers.provider.getBalance(deployer);

                //asserttse
                assert.equal(endingBalance,0);
                assert.equal(startingDeployerBalance+startingFundMeBalance, endingDeployerBalance+gasCost);

            
            })

            it("allows withdraw from multiple funders", async ()=>{
                const accounts = await ethers.getSigners();
                for(let i=1; i>6;i++){
                    const fundMeConnected = await fundMe.connect(accounts[i])
                    await fundMeConnected.fund({value:sendValue})
                }

                const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                const startingDeployerBalance = await ethers.provider.getBalance(deployer);


                //act
                const transactionResponse = await fundMe.withdraw();
                const transactionReciept = await transactionResponse.wait(1);
                const {gasUsed , gasPrice} = transactionReciept;
                const gasCost = gasUsed * gasPrice;

                //assert
                const endingBalance = await ethers.provider.getBalance(fundMe.target)
                const endingDeployerBalance = await ethers.provider.getBalance(deployer);

                assert.equal(endingBalance,0);
                assert.equal(startingDeployerBalance+startingFundMeBalance, endingDeployerBalance+gasCost);

                //Funders Reset
                await expect(fundMe.s_funders(0)).to.be.reverted;

                for(let i=1;i<6;i++){
                    assert.equal(await fundMe.s_addressToAmountFunded(accounts[i].address),0)
                }
                

                
            })

            it("only owner withdraw", async ()=>{
                const signers = await ethers.getSigners();
                const attacker = signers[1];
                const attackerConnected = await fundMe.connect(attacker);

                await expect(attackerConnected.withdraw()).to.be.rejectedWith("FundMe__NotOwner");
            })
            
            it("allows cheaper withdraw from multiple funders", async ()=>{
                
                const accounts = await ethers.getSigners();
                for(let i=1; i>6;i++){
                    const fundMeConnected = await fundMe.connect(accounts[i])
                    await fundMeConnected.fund({value:sendValue})
                }

                const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
                const startingDeployerBalance = await ethers.provider.getBalance(deployer);


                //act
                const transactionResponse = await fundMe.cheapWithdraw();
                const transactionReciept = await transactionResponse.wait(1);
                const {gasUsed , gasPrice} = transactionReciept;
                const gasCost = gasUsed * gasPrice;

                //assert
                const endingBalance = await ethers.provider.getBalance(fundMe.target)
                const endingDeployerBalance = await ethers.provider.getBalance(deployer);

                assert.equal(endingBalance,0);
                assert.equal(startingDeployerBalance+startingFundMeBalance, endingDeployerBalance+gasCost);

                //Funders Reset
                await expect(fundMe.s_funders(0)).to.be.reverted;

                for(let i=1;i<6;i++){
                    assert.equal(await fundMe.s_addressToAmountFunded(accounts[i].address),0)
                }
                

                
            })

                
    
        })
    })