// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakeToken is ERC20, Ownable{
    constructor() ERC20("Stake Token", "STK") Ownable(msg.sender){
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) external onlyOwner{
        _mint(to, amount);
    }
}

//Staking Token: 0x7915B2f2cB555D39dca26D5197aFc740EbccD5a9
//Staking: 0x2c761ea43ed24e6728290697c98e7e3f8d35b518

//rewardRate -> .0001 stk / per second 

// 1 stk = 10^18 -> 1000000000000000000