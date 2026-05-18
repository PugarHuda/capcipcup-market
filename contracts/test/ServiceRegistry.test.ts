import { expect } from "chai";
import { ethers } from "hardhat";
import { ServiceRegistry, MockMEZO } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ServiceRegistry", function () {
  let registry: ServiceRegistry;
  let mezo: MockMEZO;
  let owner: SignerWithAddress;
  let provider: SignerWithAddress;
  let other: SignerWithAddress;

  const MIN_STAKE = ethers.parseEther("100");
  const STAKE_AMOUNT = ethers.parseEther("200");
  const PRICE = ethers.parseEther("0.005");

  beforeEach(async function () {
    [owner, provider, other] = await ethers.getSigners();

    const MockMEZO = await ethers.getContractFactory("MockMEZO");
    mezo = await MockMEZO.deploy();

    const ServiceRegistry = await ethers.getContractFactory("ServiceRegistry");
    registry = await ServiceRegistry.deploy(await mezo.getAddress(), MIN_STAKE);

    await mezo.mint(provider.address, ethers.parseEther("1000"));
    await mezo.connect(provider).approve(await registry.getAddress(), ethers.MaxUint256);
  });

  describe("register", function () {
    it("should register a service with MEZO stake", async function () {
      const tx = await registry.connect(provider).register(
        "Text Summarizer",
        "https://api.example.com/summarize",
        PRICE,
        "ipfs://metadata",
        3,
        STAKE_AMOUNT
      );

      await expect(tx).to.emit(registry, "ServiceRegistered");

      const service = await registry.getService(1);
      expect(service.name).to.equal("Text Summarizer");
      expect(service.owner).to.equal(provider.address);
      expect(service.mezoStaked).to.equal(STAKE_AMOUNT);
      expect(service.isActive).to.be.true;
    });

    it("should reject stake below minimum", async function () {
      await expect(
        registry.connect(provider).register(
          "Test", "http://test", PRICE, "", 0, ethers.parseEther("50")
        )
      ).to.be.revertedWith("Stake below minimum");
    });
  });

  describe("delist", function () {
    it("should return staked MEZO on delist", async function () {
      await registry.connect(provider).register(
        "Test Service", "http://test", PRICE, "", 0, STAKE_AMOUNT
      );

      const balBefore = await mezo.balanceOf(provider.address);
      await registry.connect(provider).delist(1);
      const balAfter = await mezo.balanceOf(provider.address);

      expect(balAfter - balBefore).to.equal(STAKE_AMOUNT);

      const service = await registry.getService(1);
      expect(service.isActive).to.be.false;
    });

    it("should reject delist by non-owner", async function () {
      await registry.connect(provider).register(
        "Test", "http://test", PRICE, "", 0, STAKE_AMOUNT
      );

      await expect(
        registry.connect(other).delist(1)
      ).to.be.revertedWith("Not service owner");
    });
  });

  describe("getAllActive", function () {
    it("should return only active services", async function () {
      await registry.connect(provider).register("A", "http://a", PRICE, "", 0, STAKE_AMOUNT);
      await registry.connect(provider).register("B", "http://b", PRICE, "", 0, STAKE_AMOUNT);
      await registry.connect(provider).delist(1);

      const active = await registry.getAllActive();
      expect(active.length).to.equal(1);
      expect(active[0].name).to.equal("B");
    });
  });
});
