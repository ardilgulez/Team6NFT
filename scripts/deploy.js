const hre = require("hardhat");

async function main() {
    const Team6NFT = await hre.ethers.getContractFactory("Team6NFT");
    const team6Nft = await Team6NFT.deploy();

    await team6Nft.deployed();

    console.log(`Team6NFT deployed to ${team6Nft.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
