import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1. Deploy MockMEZO (testnet only)
  const MockMEZO = await ethers.getContractFactory("MockMEZO");
  const mockMezo = await MockMEZO.deploy();
  await mockMezo.waitForDeployment();
  const mezoAddr = await mockMezo.getAddress();
  console.log("MockMEZO deployed:", mezoAddr);

  // Mint test MEZO to deployer (for provider staking tests)
  const mintTx = await mockMezo.mint(deployer.address, ethers.parseEther("10000"));
  await mintTx.wait();
  console.log("Minted 10,000 mMEZO to deployer");

  // 2. Deploy ServiceRegistry
  const MUSD_ADDRESS = process.env.MUSD_ADDRESS || "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503";
  const MIN_STAKE = ethers.parseEther("100"); // 100 MEZO minimum

  const ServiceRegistry = await ethers.getContractFactory("ServiceRegistry");
  const registry = await ServiceRegistry.deploy(mezoAddr, MIN_STAKE);
  await registry.waitForDeployment();
  console.log("ServiceRegistry deployed:", await registry.getAddress());

  // 3. Deploy AgentVault
  const AgentVault = await ethers.getContractFactory("AgentVault");
  const vault = await AgentVault.deploy(MUSD_ADDRESS);
  await vault.waitForDeployment();
  console.log("AgentVault deployed:", await vault.getAddress());

  // 4. Deploy ReviewSystem
  const PROXY_ADDRESS = process.env.PROXY_ADDRESS || deployer.address;
  const ReviewSystem = await ethers.getContractFactory("ReviewSystem");
  const reviews = await ReviewSystem.deploy(PROXY_ADDRESS);
  await reviews.waitForDeployment();
  console.log("ReviewSystem deployed:", await reviews.getAddress());

  console.log("\n--- Deployment Summary ---");
  console.log("MockMEZO:        ", mezoAddr);
  console.log("ServiceRegistry: ", await registry.getAddress());
  console.log("AgentVault:      ", await vault.getAddress());
  console.log("ReviewSystem:    ", await reviews.getAddress());
  console.log("MUSD (testnet):  ", MUSD_ADDRESS);
  console.log("\nSave these addresses in ../.env for backend/frontend config.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
