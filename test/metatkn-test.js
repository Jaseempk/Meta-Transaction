const {expect}=require("chai");
const{getBytes,parseEther}=require("ethers");
const{ethers}=require("hardhat");

describe("MetaToken Transfer",()=>{
  it("it lets token contract to transfer token on behalf of the user",async()=>{
    
    const raandomContract=await ethers.getContractFactory("RandomToken");
    const randomContract=await raandomContract.deploy();
    await randomContract.waitForDeployment();

    const tookenSender=await ethers.getContractFactory("TokenSender");
    const tokenSender=await tookenSender.deploy();
    await tokenSender.waitForDeployment();

    const[_,userAddress,relayerAddress,recipientAddress]=await ethers.getSigners();

    const TOTAL_SUPPLY=parseEther("10000");

    const userRandomConractInstance=randomContract.connect(userAddress);
    const mintTx=await userRandomConractInstance.freeMint(TOTAL_SUPPLY);
    await mintTx.wait();

    const approveTxn=await userRandomConractInstance.approve(
      tokenSender.target,
      BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    );
    await approveTxn.wait();

    const tokenForFirstTransfer=parseEther("10");
    let nonce=1;

    const messageHashOne=await tokenSender.getHash(
      userAddress.address,
      tokenForFirstTransfer,
      recipientAddress.address,
      randomContract.target,
      nonce
    );

    const signatureOne=await userAddress.signMessage(getBytes(messageHashOne));

    const tokenContractWithRelayerInstance=tokenSender.connect(relayerAddress);

    const metaTxn1=await tokenContractWithRelayerInstance.transfer(
      userAddress.address,
      tokenForFirstTransfer,
      recipientAddress.address,
      randomContract.target,
      nonce,
      signatureOne
    )
    metaTxn1.wait();

    const tokenForSecTransfer=parseEther("15");
    nonce++;
    const messageHashTwo=await tokenSender.getHash(
      userAddress.address,
      tokenForSecTransfer,
      recipientAddress.address,
      randomContract.target,
      nonce
    )
    const signatureTwo=await userAddress.signMessage(getBytes(messageHashTwo));
    const metaTxn2=await tokenContractWithRelayerInstance.transfer(
      userAddress.address,
      tokenForSecTransfer,
      recipientAddress.address,
      randomContract.target,
      nonce,
      signatureTwo
    )
    await metaTxn2.wait();

    const userBalance=await randomContract.balanceOf(userAddress.address);

    const recipientBalance=await randomContract.balanceOf(recipientAddress.address);

    expect(userBalance).to.equal(parseEther("9975"));
    expect(recipientBalance).to.eq(parseEther("25"));
    
  })
  it("it should fail when multiple transfers is tried with same nonce",async()=>{

    const randomContract=await ethers.getContractFactory("RandomToken");
    const randomToken=await randomContract.deploy();
    await randomToken.waitForDeployment();

    const tookenSender=await ethers.getContractFactory("TokenSender");
    const tokenSender=await tookenSender.deploy();
    await tokenSender.waitForDeployment();

    const[_,userAddress,relayerAddress,recipientAddress]=await ethers.getSigners();

    const TOTAL_SUPPLY=parseEther("1000");
    const randomTokenUserInstance= randomToken.connect(userAddress);
    const mintTxn=await randomTokenUserInstance.freeMint(TOTAL_SUPPLY);
    await mintTxn.wait();

    const apprTxn=await randomTokenUserInstance.approve(
      tokenSender.target,
      BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    );
    await apprTxn.wait();

    let nonce=1;
    const tokenToTransfer=parseEther("20");
    const messageHash=await tokenSender.getHash(
      userAddress.address,
      tokenToTransfer,
      recipientAddress.address,
      randomToken.target,
      nonce
    )
    const signature=await userAddress.signMessage(getBytes(messageHash));

    const tokenSenderRelayerInstance=tokenSender.connect(relayerAddress);
    
    const metaTxn=await tokenSenderRelayerInstance.transfer(
      userAddress.address,
      tokenToTransfer,
      recipientAddress.address,
      randomToken.target,
      nonce,
      signature
    )
    await metaTxn.wait();
    expect(tokenSenderRelayerInstance.transfer(
      userAddress.address,
      tokenToTransfer,
      recipientAddress.address,
      randomToken.target,
      nonce,
      signature
    )).to.be.rejectedWith("already executed");
  })
})