import { ethers } from "ethers";
import { config } from "../config.js";

const ABI = [
  "function registerAgent(string _name, string _dataCID) external",
  "function updateDataCID(string _newCID) external",
  "function updateReputation(address _agent, uint256 _score) external",
  "function recordEarnings(address _agent, uint256 _amount, uint256 _requests) external",
  "function getAgent(address _agent) external view returns (tuple(address walletAddress, string name, string dataCID, uint256 reputationScore, uint256 totalEarnings, uint256 totalRequests, uint256 registrationTime, bool isActive))",
  "function getAllAgents() external view returns (address[])",
  "function getAgentCount() external view returns (uint256)",
];

function getContract(): ethers.Contract {
  if (!config.FEVM_PRIVATE_KEY || !config.REGISTRY_CONTRACT_ADDRESS) {
    throw new Error("FEVM_PRIVATE_KEY and REGISTRY_CONTRACT_ADDRESS must be set");
  }
  const provider = new ethers.JsonRpcProvider(config.FEVM_RPC_URL);
  const wallet = new ethers.Wallet(config.FEVM_PRIVATE_KEY, provider);
  return new ethers.Contract(config.REGISTRY_CONTRACT_ADDRESS, ABI, wallet);
}

function getReadOnlyContract(): ethers.Contract {
  if (!config.REGISTRY_CONTRACT_ADDRESS) {
    throw new Error("REGISTRY_CONTRACT_ADDRESS must be set");
  }
  const provider = new ethers.JsonRpcProvider(config.FEVM_RPC_URL);
  return new ethers.Contract(config.REGISTRY_CONTRACT_ADDRESS, ABI, provider);
}

export async function registerAgent(name: string, dataCID: string): Promise<void> {
  const contract = getContract();
  const tx = await contract.registerAgent(name, dataCID);
  console.log(`[Identity] registerAgent tx: ${tx.hash}`);
  await tx.wait();
  console.log(`[Identity] Agent "${name}" registered on-chain`);
}

export async function updateDataCID(newCID: string): Promise<void> {
  const contract = getContract();
  const tx = await contract.updateDataCID(newCID);
  console.log(`[Identity] updateDataCID tx: ${tx.hash}`);
  await tx.wait();
  console.log(`[Identity] Data CID updated to: ${newCID}`);
}

export async function getAgent(address: string): Promise<unknown> {
  const contract = getReadOnlyContract();
  const agent = await contract.getAgent(address);
  return {
    walletAddress: agent.walletAddress,
    name: agent.name,
    dataCID: agent.dataCID,
    reputationScore: Number(agent.reputationScore),
    totalEarnings: Number(agent.totalEarnings),
    totalRequests: Number(agent.totalRequests),
    registrationTime: Number(agent.registrationTime),
    isActive: agent.isActive,
  };
}
