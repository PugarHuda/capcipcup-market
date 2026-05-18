// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Testnet-only mock of the MEZO token. Anyone can mint for testing.
/// On mainnet, ServiceRegistry would point to the real MEZO address.
contract MockMEZO is ERC20 {
    constructor() ERC20("Mock MEZO", "mMEZO") {}

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}
