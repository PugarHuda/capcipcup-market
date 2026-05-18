// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ReviewSystem {
    struct Review {
        address reviewer;
        uint256 serviceId;
        uint8 score;
        string comment;
        uint256 timestamp;
    }

    address public proxyAddress;

    mapping(uint256 => Review[]) public serviceReviews;
    mapping(address => mapping(uint256 => bool)) public hasPaid;
    mapping(address => mapping(uint256 => bool)) public hasReviewed;

    uint256 public totalReviews;

    event BuyerVerified(address indexed buyer, uint256 indexed serviceId);
    event ReviewSubmitted(
        address indexed reviewer,
        uint256 indexed serviceId,
        uint8 score
    );

    modifier onlyProxy() {
        require(msg.sender == proxyAddress, "Only proxy can call");
        _;
    }

    constructor(address _proxyAddress) {
        proxyAddress = _proxyAddress;
    }

    function markAsBuyer(address _buyer, uint256 _serviceId) external onlyProxy {
        hasPaid[_buyer][_serviceId] = true;
        emit BuyerVerified(_buyer, _serviceId);
    }

    function rate(uint256 _serviceId, uint8 _score, string calldata _comment) external {
        require(hasPaid[msg.sender][_serviceId], "Not a verified buyer");
        require(!hasReviewed[msg.sender][_serviceId], "Already reviewed");
        require(_score >= 1 && _score <= 5, "Score must be 1-5");

        serviceReviews[_serviceId].push(Review({
            reviewer: msg.sender,
            serviceId: _serviceId,
            score: _score,
            comment: _comment,
            timestamp: block.timestamp
        }));

        hasReviewed[msg.sender][_serviceId] = true;
        totalReviews++;

        emit ReviewSubmitted(msg.sender, _serviceId, _score);
    }

    function getReviews(uint256 _serviceId) external view returns (Review[] memory) {
        return serviceReviews[_serviceId];
    }

    function getReviewCount(uint256 _serviceId) external view returns (uint256) {
        return serviceReviews[_serviceId].length;
    }

    function getAverageScore(uint256 _serviceId) external view returns (uint256) {
        Review[] storage reviews = serviceReviews[_serviceId];
        if (reviews.length == 0) return 0;

        uint256 total = 0;
        for (uint256 i = 0; i < reviews.length; i++) {
            total += reviews[i].score;
        }
        return (total * 100) / reviews.length;
    }
}
