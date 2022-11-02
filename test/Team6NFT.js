const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Team6NFT", function () {
    async function deployVolcanoCoinAndNft() {
        const [owner, otherAccount] = await ethers.getSigners();

        const VolcanoCoin = await ethers.getContractFactory("VolcanoCoin");

        const volcanoCoin = await VolcanoCoin.deploy();

        const Team6NFT = await ethers.getContractFactory("Team6NFT");
        const team6Nft = await Team6NFT.deploy(volcanoCoin.address);

        return { volcanoCoin, team6Nft, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { team6Nft, owner } = await loadFixture(
                deployVolcanoCoinAndNft
            );

            expect(await team6Nft.owner()).to.equal(owner.address);
        });
    });

    describe("Withdrawals", function () {
        describe("Validations", function () {
            it("Should revert with the right error if minted with insufficient value", async function () {
                const { team6Nft, owner, otherAccount } = await loadFixture(
                    deployVolcanoCoinAndNft
                );

                // We use lock.connect() to send a transaction from another account
                await expect(
                    team6Nft
                        .connect(otherAccount)
                        .mintWithEth(
                            otherAccount.address,
                            "https://google.com",
                            { value: ethers.utils.parseEther("0.005") }
                        )
                ).to.be.revertedWith("Pay more you dumbass");
            });

            it("Should revert with the right error if minted with insufficient volcano coin balance", async function () {
                const { team6Nft, owner, otherAccount } = await loadFixture(
                    deployVolcanoCoinAndNft
                );

                // We use lock.connect() to send a transaction from another account
                await expect(
                    team6Nft
                        .connect(otherAccount)
                        .mintWithVolcanoCoin(
                            otherAccount.address,
                            "https://google.com",
                            { value: ethers.utils.parseEther("0.005") }
                        )
                ).to.be.revertedWith(
                    "There needs to be at least some Volcano Coin Allowance, you know? Even 1 would do."
                );
            });
        });

        describe("Minting", function () {
            it("Should mint the token with eth", async function () {
                const { team6Nft, owner, otherAccount } = await loadFixture(
                    deployVolcanoCoinAndNft
                );
                await team6Nft.mintWithEth(
                    owner.address,
                    "https://google.com",
                    { value: ethers.utils.parseEther("0.01") }
                );

                expect(await team6Nft.balanceOf(owner.address)).to.equal(1);
                expect(await team6Nft.balanceOf(otherAccount.address)).to.equal(
                    0
                );

                expect(await team6Nft.ownerOf(0)).to.equal(owner.address);
            });

            it("Should mint the token with Volcano Coin", async function () {
                const { volcanoCoin, team6Nft, owner, otherAccount } =
                    await loadFixture(deployVolcanoCoinAndNft);

                expect(
                    await volcanoCoin.allowance(owner.address, team6Nft.address)
                ).to.equal(0);

                await volcanoCoin.allow(1, team6Nft.address);
                expect(
                    await volcanoCoin.allowance(owner.address, team6Nft.address)
                ).to.equal(1);
                await team6Nft.mintWithVolcanoCoin(
                    owner.address,
                    "https://google.com"
                );

                expect(await team6Nft.balanceOf(owner.address)).to.equal(1);
                expect(await team6Nft.balanceOf(otherAccount.address)).to.equal(
                    0
                );

                expect(await team6Nft.ownerOf(0)).to.equal(owner.address);
            });
        });

        describe("Transfers", function () {
            it("Should mint the token with eth and transfer", async function () {
                const { team6Nft, owner, otherAccount } = await loadFixture(
                    deployVolcanoCoinAndNft
                );
                await team6Nft.mintWithEth(
                    owner.address,
                    "https://google.com",
                    { value: ethers.utils.parseEther("0.01") }
                );

                expect(await team6Nft.balanceOf(owner.address)).to.equal(1);
                expect(await team6Nft.balanceOf(otherAccount.address)).to.equal(
                    0
                );

                expect(await team6Nft.ownerOf(0)).to.equal(owner.address);

                await team6Nft.transferFrom(
                    owner.address,
                    otherAccount.address,
                    0
                );

                expect(await team6Nft.balanceOf(owner.address)).to.equal(0);
                expect(await team6Nft.balanceOf(otherAccount.address)).to.equal(
                    1
                );
                expect(await team6Nft.ownerOf(0)).to.equal(
                    otherAccount.address
                );
            });
        });
    });
});
