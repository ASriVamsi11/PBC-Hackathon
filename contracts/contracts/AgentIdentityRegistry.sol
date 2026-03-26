// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AgentIdentityRegistry {
    struct Agent {
        address walletAddress;
        string name;
        string dataCID;
        uint256 reputationScore;
        uint256 totalEarnings;
        uint256 totalRequests;
        uint256 registrationTime;
        bool isActive;
    }

    address public owner;
    mapping(address => Agent) public agents;
    address[] public agentAddresses;

    event AgentRegistered(address indexed agent, string name, string dataCID);
    event DataCIDUpdated(address indexed agent, string newCID);
    event ReputationUpdated(address indexed agent, uint256 newScore);
    event EarningsRecorded(address indexed agent, uint256 amount, uint256 requests);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyRegistered() {
        require(agents[msg.sender].isActive, "Agent not registered");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerAgent(string calldata _name, string calldata _dataCID) external {
        require(!agents[msg.sender].isActive, "Already registered");

        agents[msg.sender] = Agent({
            walletAddress: msg.sender,
            name: _name,
            dataCID: _dataCID,
            reputationScore: 500,
            totalEarnings: 0,
            totalRequests: 0,
            registrationTime: block.timestamp,
            isActive: true
        });

        agentAddresses.push(msg.sender);
        emit AgentRegistered(msg.sender, _name, _dataCID);
    }

    function updateDataCID(string calldata _newCID) external onlyRegistered {
        agents[msg.sender].dataCID = _newCID;
        emit DataCIDUpdated(msg.sender, _newCID);
    }

    function updateReputation(address _agent, uint256 _score) external onlyOwner {
        require(_score <= 1000, "Score must be 0-1000");
        require(agents[_agent].isActive, "Agent not registered");
        agents[_agent].reputationScore = _score;
        emit ReputationUpdated(_agent, _score);
    }

    function recordEarnings(address _agent, uint256 _amount, uint256 _requests) external onlyOwner {
        require(agents[_agent].isActive, "Agent not registered");
        agents[_agent].totalEarnings += _amount;
        agents[_agent].totalRequests += _requests;
        emit EarningsRecorded(_agent, _amount, _requests);
    }

    function getAgent(address _agent) external view returns (Agent memory) {
        return agents[_agent];
    }

    function getAllAgents() external view returns (address[] memory) {
        return agentAddresses;
    }

    function getAgentCount() external view returns (uint256) {
        return agentAddresses.length;
    }
}
