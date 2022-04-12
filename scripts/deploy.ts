// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  const payees = [
    '0xbda5747bfd65f08deb54cb465eb87d40e51b197e',
    '0xdd2fd4581271e230360230f9337d5c0430bf44c0',
    '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199'
  ]
  const shares = [20, 40, 40]

  const Payment = await ethers.getContractFactory("Payment")
  const payment = await Payment.deploy(payees, shares);
  await payment.deployed();
  const paymentAddress = payment.address

  const NFT = await ethers.getContractFactory("NFT")
  const nft = await NFT.deploy("NFTToken", "NFT", "https://localhost:3000", paymentAddress)
  await nft.deployed()
  const nftAddress = nft.address

  console.log("paymentAddress : ", paymentAddress)
  console.log("nftAddress : ", nftAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
