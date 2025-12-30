// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is ReentrancyGuard, Ownable{
    using SafeERC20 for IERC20;

    IERC20 public stakingToken;
    IERC20 public rewardToken;

    uint256 public rewardRate;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    uint256 public totalStaked; 
    uint256 public minimumStake;

    struct UserInfo{
        uint256 stakedAmount;
        uint256 rewardDebt;
        uint256 rewards;
        uint256 lastStakeTime;
    }

    mapping (address => UserInfo) public userInfo;
    mapping (address => uint256) public userRewardPerTokenPaid;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate);

    constructor(address _stakingToken, address _rewardToken, uint256 _rewardRate) Ownable(msg.sender){
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        rewardRate = _rewardRate;
        minimumStake = 1 * 10 ** 18;
        lastUpdateTime = block.timestamp;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        if(account != address(0)){
            userInfo[account].rewards = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function rewardPerToken() public view returns(uint256){
        if(totalStaked == 0){
            return rewardPerTokenStored;
        
        }
        return rewardPerTokenStored + (((block.timestamp - lastUpdateTime) * rewardRate * 1e18)/ totalStaked);
    }

    function earned(address account) public view returns(uint256){
        UserInfo storage user = userInfo[account];

        return (user.stakedAmount * (rewardPerToken()-userRewardPerTokenPaid[account]))/1e18 + user.rewards;
    }

    function getStakeInfo(address account) external view returns (uint256 stakedAmount, uint256 pendingRewards, uint256 lastStakeTime) {
        UserInfo storage user = userInfo[account];

        return (
            user.stakedAmount,
            earned(account),
            user.lastStakeTime
        );
    }

    //APY -> Annual Percentage Yield

    function getAPY() external view returns(uint256){
        if(totalStaked == 0)return 0;

        uint256 annualRewards = rewardRate * 365 * 24 * 60 * 60;

        return (annualRewards * 10000) / totalStaked;
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender){
        require(amount >= minimumStake, "Amount below minimum");

        UserInfo storage user = userInfo[msg.sender];

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        user.stakedAmount += amount;

        user.lastStakeTime = block.timestamp;

        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender){
        UserInfo storage user = userInfo[msg.sender];

        require(user.stakedAmount >= amount, "Insufficient staked amount");

        user.stakedAmount -= amount;

        totalStaked -= amount;

        stakingToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    function claimRewards() external nonReentrant updateReward(msg.sender){
        UserInfo storage user = userInfo[msg.sender];

        uint256 reward = user.rewards;

        require(reward > 0, "No rewards to claim");

        user.rewards = 0;

        rewardToken.safeTransfer(msg.sender, reward);

        emit RewardsClaimed(msg.sender, reward);
    }

    function exit() external {
        UserInfo storage user = userInfo[msg.sender];
        
        uint256 stakedAmount = user.stakedAmount;

        if(stakedAmount > 0){
            this.withdraw(stakedAmount);
        }

        this.claimRewards();
    }


    function setRewardRate(uint256 newRate) external onlyOwner updateReward(address(0)){
        rewardRate = newRate;

        emit RewardRateUpdated(newRate);
    }

    function setMinimumStake(uint256 newMinimum) external onlyOwner{
        minimumStake = newMinimum;
    }

    function depositRewardTokens(uint256 amount) external onlyOwner {
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner{
        IERC20(token).safeTransfer(owner(), amount);
    }

}

//100000000000000000000000