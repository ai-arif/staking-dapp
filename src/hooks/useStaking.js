import { ethers } from "ethers";
import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "../context/Web3Context";

export const useStaking = () => {
  const { account, stakeTokenContract, stakingContract, isConnect } = useWeb3();

  const [tokenBalance, setTokenBalance] = useState("0");
  const [stakedAmount, setStakedAmount] = useState("0");
  const [pendingRewards, setPendingRewards] = useState("0");
  const [totalStaked, setTotalStaked] = useState("0");
  const [apy, setApy] = useState("0");
  const [allowance, setAllowance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [txMessage, setTxMessage] = useState("");

  //fetch all staking data

  const fetchStakingData = useCallback(async () => {
    if (!isConnect || !stakeTokenContract || !stakingContract || !account) {
      return;
    }

    try {
      const [
        balance,
        stakeInfo,
        totalStakedAmount,
        currentApy,
        currentAllowance,
      ] = await Promise.all([
        stakeTokenContract.balanceOf(account),
        stakingContract.getStakeInfo(account),
        stakingContract.totalStaked(),
        stakeTokenContract.getAPY(),
        stakeTokenContract.allowance(
          account,
          await stakingContract.getAddress()
        ),
      ]);

      setTokenBalance(ethers.formatEther(balance));
      setStakedAmount(ethers.formatEther(stakeInfo.stakedAmount));
      setPendingRewards(ethers.formatEther(stakeInfo.pendingRewards));
      setTotalStaked(ethers.formatEther(totalStakedAmount));
      setApy((Number(currentApy) / 100).toFixed(2));
      setAllowance(ethers.formatEther(currentAllowance));
    } catch (error) {
      console.error("error fetching staking data: ", error);
    }
  }, [account, stakeTokenContract, stakingContract, isConnect]);

  useEffect(() => {
    fetchStakingData();

    //refresh every 10 seconds for rewards update

    const interval = setInterval(fetchStakingData, 10000);
    return () => clearInterval(interval);
  }, [fetchStakingData]);

  //Approve tokens for staking

  const approveTokens = async (amount) => {
    if (!stakeTokenContract || !stakingContract) return false;

    setIsLoading(true);
    setTxStatus("pending");
    setTxMessage("Approving tokens...");

    try {
      const amountWei = ethers.parseEther(amount.toString());
      const stakingAddress = await stakingContract.getAddress();

      const tx = await stakeTokenContract.approve(stakingAddress, amountWei);
      setTxMessage("Waiting for confirmation");

      await tx.wait();

      setTxStatus("success");
      setTxMessage("Tokens approved successfully");
      await fetchStakingData();
      return true;
    } catch (error) {
      console.error("Approve error: ", error);
      setTxStatus("error");
      setTxMessage(error.reason || "Failed to approve tokens");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  //Stake tokens
  const stakeTokens = async (amount) => {
    if (!stakingContract) return false;

    setIsLoading(true);
    setTxStatus("pending");
    setTxMessage("Staking tokens...");

    try {
      const amountWei = ethers.parseEther(amount.toString());

      const tx = await stakingContract.stake(amountWei);
      setTxMessage("Waiting for confirmation..");

      await tx.wait();

      setTxStatus("success");
      setTxMessage(`Successfully staked ${amount} STK`);
      await fetchStakingData();
      return true;
    } catch (error) {
      console.error("Stake error: ", error);
      setTxStatus("Error");
      setTxMessage(error.reason || "Failed to stake tokens");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  //withdraw staked tokens
  const withdrawTokens = async (amount) => {
    if (!stakingContract) return false;

    setIsLoading(true);
    setTxStatus("pending");
    setTxMessage("Withdrawing tokens...");

    try {
      const amountWei = ethers.parseEther(amount.toString());

      const tx = await stakingContract.withdraw(amountWei);
      setTxMessage("Waiting for confirmation..");

      await tx.wait();

      setTxStatus("success");
      setTxMessage(`Successfully wathdrawn ${amount} STK`);
      await fetchStakingData();
      return true;
    } catch (error) {
      console.error("Withdrawing error: ", error);
      setTxStatus("Error");
      setTxMessage(error.reason || "Failed to Withdrawing tokens");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  //claim rewards

  const claimRewards = async () => {
    if (!stakingContract) return false;

    setIsLoading(true);
    setTxStatus("pending");
    setTxMessage("Claiming tokens...");

    try {
      const amountWei = ethers.parseEther(amount.toString());

      const tx = await stakingContract.claimRewards(amountWei);
      setTxMessage("Waiting for confirmation..");

      await tx.wait();

      setTxStatus("success");
      setTxMessage(`Successfully Claimed ${amount} STK`);
      await fetchStakingData();
      return true;
    } catch (error) {
      console.error("Claiming error: ", error);
      setTxStatus("Error");
      setTxMessage(error.reason || "Failed to Claiming tokens rewards");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearTxStatus = () => {
    setTxStatus(null);
    setTxMessage("");
  };

  const needsApproval = (amount) => {
    if (!amount || isNaN(amount)) return false;

    return parseFloat(allowance < parseFloat(amount));
  };

  return {
    //data
    tokenBalance,
    stakedAmount,
    pendingRewards,
    totalStaked,
    apy,
    allowance,

    //status
    isLoading,
    txStatus,
    txMessage,

    //actions
    approveTokens,
    stakeTokens,
    withdrawTokens,
    claimRewards,
    fetchStakingData,
    clearTxStatus,
    needsApproval,
  };
};
