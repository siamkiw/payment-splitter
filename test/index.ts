import { expect } from "chai";
import { BigNumber, ContractTransaction, providers, Signer } from "ethers";
import { ethers, waffle } from "hardhat";
import {NFT, PaymentSpl, NFT__factory, PaymentSpl__factory } from "../typechain";


describe("NFT and Payment Contract", async function () {

  let payment: PaymentSpl
  let nft: NFT
  let owner: Signer, addr1: Signer, addr2: Signer, addr3: Signer
  let ownerAddress: string, address1: string, address2: string, address3: string
  let payees: string[]
  let shares: number[] = [20, 40, 40]

  const tokenName: string = "NFTToken"
  const tokenSymbol: string = "NFT"
  const baseURL: string = "https://localhost:3000"

  const toWei = ethers.utils.parseEther
  const toEther = ethers.utils.formatEther

  const provider = waffle.provider;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners()

    ownerAddress = await owner.getAddress()
    address1 = await addr1.getAddress()
    address2 = await addr2.getAddress()
    address3 = await addr3.getAddress()

    payees = [address1, address2, address3]

    payment = await new PaymentSpl__factory(owner).deploy(payees, shares)
    await payment.deployed()
    const paymentAddress = payment.address

    nft = await new NFT__factory(owner).deploy(tokenName, tokenSymbol, baseURL, paymentAddress)
    await nft.deployed()
    const nftAddress = nft.address

  })

  describe("Deployment", async function () {

    it("Should assign 20 nft to owner address", async function () {
      expect(await nft.balanceOf(ownerAddress)).to.equal(20)
    })

    it("Should have correct data for contract", async function () {
      expect(await nft.name()).to.equal(tokenName)
      expect(await nft.symbol()).to.equal(tokenSymbol)
      expect(await nft.baseURI()).to.equal(baseURL)
    })

  })

  describe("Minting NFT", async function () {

    it("Should minted nft to addresses and withdraw to payees", async function () {

      const value: BigNumber = toWei("100.0") 

      await nft.mint(address1, 10, { 
        from: ownerAddress, 
        value: value
      })

      const addr1Balance = await nft.balanceOf(await addr1.getAddress())

      expect(addr1Balance).to.equal(10)

      await nft.withdraw({from: ownerAddress})

      let paymentBalance = toEther(await provider.getBalance(payment.address))
      
      expect(parseInt(paymentBalance)).to.equal(100)

      let preAddr1BalanceEth = toEther(await addr1.getBalance())
      let preAddr2BalanceEth = toEther(await addr2.getBalance())
      let preAddr3BalanceEth = toEther(await addr3.getBalance())

      // withdraw ether to payees addresses
      await payment["release(address)"](address1)
      await payment["release(address)"](address2)
      await payment["release(address)"](address3)

      let addr1BalanceEth = toEther(await addr1.getBalance())
      let addr2BalanceEth = toEther(await addr2.getBalance())
      let addr3BalanceEth = toEther(await addr3.getBalance())

      expect(parseInt(addr1BalanceEth)).to.equal(parseInt(preAddr1BalanceEth) + 20)
      expect(parseInt(addr2BalanceEth)).to.equal(parseInt(preAddr2BalanceEth) + 40)
      expect(parseInt(addr3BalanceEth)).to.equal(parseInt(preAddr3BalanceEth) + 40)
    })

  })

});
