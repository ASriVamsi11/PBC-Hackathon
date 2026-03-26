import { ethers } from "hardhat";

async function main() {
  const Registry = await ethers.getContractFactory("AgentIdentityRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`AgentIdentityRegistry deployed to: ${address}`);
  console.log(`Set REGISTRY_CONTRACT_ADDRESS=${address} in agent-server/.env`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
