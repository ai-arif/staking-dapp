import React, { useState, useEffect } from "react";
import { useStaking } from "../hooks/useStaking";

const UserStats = () => {
  const {
    tokenBalance,
    stakedAmount,
    approveTokens,
    stakeTokens,
    withdrawTokens,
    isLoading,
    txStatus,
    txMessage,
    clearTxStatus,
    needsApproval,
  } = useStaking();

  return (
    <div className="card">
      <div className="card-header">
        <h2>Your Position</h2>
      </div>

      <div className="user-stats">
        <div className="user-stat-label">Wallet Balance</div>
        <div className="user-stat-value">{tokenBalance}</div>
      </div>
      <div className="user-stats">
        <div className="user-stat-label">Staked Amount</div>
        <div className="user-stat-value">{parseFloat(stakedAmount)}</div>
      </div>
      <div className="user-stats">
        <div className="user-stat-label">Pending Rewards</div>
        <div className="user-stat-value">{withdrawTokens}</div>
      </div>
    </div>
  );
};

export default UserStats;
