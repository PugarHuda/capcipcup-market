// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ServiceRegistry is ReentrancyGuard {
    struct Service {
        uint256 id;
        address owner;
        string name;
        string endpoint;
        uint256 pricePerRequest;
        string metadataURI;
        uint256 mezoStaked;
        uint256 freeTierLimit;
        bool isActive;
        uint256 registeredAt;
    }

    IERC20 public immutable mezoToken;
    uint256 public minStake;

    uint256 public serviceCount;
    mapping(uint256 => Service) public services;
    mapping(address => uint256[]) public ownerServices;

    event ServiceRegistered(
        uint256 indexed serviceId,
        address indexed owner,
        string name,
        uint256 pricePerRequest,
        uint256 mezoStaked
    );
    event ServiceUpdated(uint256 indexed serviceId);
    event ServiceDelisted(uint256 indexed serviceId, uint256 mezoReturned);

    constructor(address _mezoToken, uint256 _minStake) {
        mezoToken = IERC20(_mezoToken);
        minStake = _minStake;
    }

    function register(
        string calldata _name,
        string calldata _endpoint,
        uint256 _pricePerRequest,
        string calldata _metadataURI,
        uint256 _freeTierLimit,
        uint256 _stakeAmount
    ) external nonReentrant returns (uint256) {
        require(_stakeAmount >= minStake, "Stake below minimum");
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_endpoint).length > 0, "Endpoint required");

        mezoToken.transferFrom(msg.sender, address(this), _stakeAmount);

        serviceCount++;
        services[serviceCount] = Service({
            id: serviceCount,
            owner: msg.sender,
            name: _name,
            endpoint: _endpoint,
            pricePerRequest: _pricePerRequest,
            metadataURI: _metadataURI,
            mezoStaked: _stakeAmount,
            freeTierLimit: _freeTierLimit,
            isActive: true,
            registeredAt: block.timestamp
        });

        ownerServices[msg.sender].push(serviceCount);

        emit ServiceRegistered(
            serviceCount,
            msg.sender,
            _name,
            _pricePerRequest,
            _stakeAmount
        );

        return serviceCount;
    }

    function update(
        uint256 _serviceId,
        string calldata _endpoint,
        uint256 _pricePerRequest,
        string calldata _metadataURI,
        uint256 _freeTierLimit
    ) external {
        Service storage svc = services[_serviceId];
        require(svc.owner == msg.sender, "Not service owner");
        require(svc.isActive, "Service not active");

        svc.endpoint = _endpoint;
        svc.pricePerRequest = _pricePerRequest;
        svc.metadataURI = _metadataURI;
        svc.freeTierLimit = _freeTierLimit;

        emit ServiceUpdated(_serviceId);
    }

    function delist(uint256 _serviceId) external nonReentrant {
        Service storage svc = services[_serviceId];
        require(svc.owner == msg.sender, "Not service owner");
        require(svc.isActive, "Already delisted");

        svc.isActive = false;
        uint256 stakeReturn = svc.mezoStaked;
        svc.mezoStaked = 0;

        mezoToken.transfer(msg.sender, stakeReturn);

        emit ServiceDelisted(_serviceId, stakeReturn);
    }

    function getService(uint256 _serviceId) external view returns (Service memory) {
        return services[_serviceId];
    }

    function getAllActive() external view returns (Service[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= serviceCount; i++) {
            if (services[i].isActive) activeCount++;
        }

        Service[] memory result = new Service[](activeCount);
        uint256 idx = 0;
        for (uint256 i = 1; i <= serviceCount; i++) {
            if (services[i].isActive) {
                result[idx] = services[i];
                idx++;
            }
        }
        return result;
    }

    function getServicesByOwner(address _owner) external view returns (Service[] memory) {
        uint256[] storage ids = ownerServices[_owner];
        Service[] memory result = new Service[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = services[ids[i]];
        }
        return result;
    }
}
