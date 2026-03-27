import { ethers } from "ethers";

const ABI = [
  "function getAgent(address _agent) external view returns (tuple(address walletAddress, string name, string dataCID, uint256 reputationScore, uint256 totalEarnings, uint256 totalRequests, uint256 registrationTime, bool isActive))",
  "function getAllAgents() external view returns (address[])",
  "function getAgentCount() external view returns (uint256)",
];

const FEVM_RPC = process.env.NEXT_PUBLIC_FEVM_RPC || "https://api.calibration.node.glif.io/rpc/v1";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

function getContract(): ethers.Contract {
  const provider = new ethers.JsonRpcProvider(FEVM_RPC);
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
}

export async function getAgentOnChain(address: string) {
  const contract = getContract();
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

export async function getAllAgents(): Promise<string[]> {
  const contract = getContract();
  return contract.getAllAgents();
}

export async function getAgentCount(): Promise<number> {
  const contract = getContract();
  const count = await contract.getAgentCount();
  return Number(count);
}
