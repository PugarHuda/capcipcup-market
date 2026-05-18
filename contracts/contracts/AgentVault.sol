// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AgentVault is ReentrancyGuard {
    IERC20 public immutable musdToken;

    struct VaultData {
        uint256 balance;
        uint256 dailyLimit;
        address owner;
    }

    mapping(address => VaultData) public vaults;
    mapping(address => mapping(address => bool)) public isOperator;
    mapping(address => mapping(address => uint256)) public dailySpent;
    mapping(address => mapping(address => uint256)) public lastResetTime;

    event Deposited(address indexed owner, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);
    event DailyLimitSet(address indexed owner, uint256 limit);
    event OperatorApproved(address indexed owner, address indexed operator);
    event OperatorRevoked(address indexed owner, address indexed operator);
    event FundsRequested(address indexed owner, address indexed operator, uint256 amount);

    constructor(address _musdToken) {
        musdToken = IERC20(_musdToken);
    }

    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be > 0");

        musdToken.transferFrom(msg.sender, address(this), _amount);

        VaultData storage v = vaults[msg.sender];
        if (v.owner == address(0)) {
            v.owner = msg.sender;
        }
        v.balance += _amount;

        emit Deposited(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external nonReentrant {
        VaultData storage v = vaults[msg.sender];
        require(v.owner == msg.sender, "Not vault owner");
        require(v.balance >= _amount, "Insufficient balance");

        v.balance -= _amount;
        musdToken.transfer(msg.sender, _amount);

        emit Withdrawn(msg.sender, _amount);
    }

    function setDailyLimit(uint256 _limit) external {
        VaultData storage v = vaults[msg.sender];
        require(v.owner == msg.sender, "Not vault owner");
        v.dailyLimit = _limit;
        emit DailyLimitSet(msg.sender, _limit);
    }

    function approveOperator(address _operator) external {
        require(vaults[msg.sender].owner == msg.sender, "Not vault owner");
        require(_operator != address(0), "Invalid operator");
        isOperator[msg.sender][_operator] = true;
        emit OperatorApproved(msg.sender, _operator);
    }

    function revokeOperator(address _operator) external {
        require(vaults[msg.sender].owner == msg.sender, "Not vault owner");
        isOperator[msg.sender][_operator] = false;
        emit OperatorRevoked(msg.sender, _operator);
    }

    function requestFunds(address _vaultOwner, uint256 _amount) external nonReentrant {
        require(isOperator[_vaultOwner][msg.sender], "Not approved operator");

        VaultData storage v = vaults[_vaultOwner];
        require(v.balance >= _amount, "Insufficient vault balance");

        if (block.timestamp > lastResetTime[_vaultOwner][msg.sender] + 24 hours) {
            dailySpent[_vaultOwner][msg.sender] = 0;
            lastResetTime[_vaultOwner][msg.sender] = block.timestamp;
        }

        require(
            dailySpent[_vaultOwner][msg.sender] + _amount <= v.dailyLimit,
            "Daily limit exceeded"
        );

        dailySpent[_vaultOwner][msg.sender] += _amount;
        v.balance -= _amount;
        musdToken.transfer(msg.sender, _amount);

        emit FundsRequested(_vaultOwner, msg.sender, _amount);
    }

    function getVaultInfo(address _owner)
        external
        view
        returns (uint256 balance, uint256 dailyLimit)
    {
        VaultData storage v = vaults[_owner];
        return (v.balance, v.dailyLimit);
    }

    function getOperatorSpent(address _owner, address _operator)
        external
        view
        returns (uint256 spent, uint256 limit, uint256 resetTime)
    {
        return (
            dailySpent[_owner][_operator],
            vaults[_owner].dailyLimit,
            lastResetTime[_owner][_operator]
        );
    }
}
