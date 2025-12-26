import React, { useState, useEffect } from "react";
import { useStaking } from "../hooks/useStaking";

const StakingForm = () => {
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

  const [activeTab, setActiveTab] = useState("stake");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    setAmount("");
    clearTxStatus();
  }, [activeTab]);

  const handleMax = () => {
    if (activeTab === "stake") {
      setAmount(tokenBalance);
    } else {
      setAmount(stakedAmount);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    if (activeTab === "stake") {
      if (needsApproval(amount)) {
        const approved = await approveTokens(amount);
        if (!approved) return;
      }
      await stakeTokens(amount);
    } else {
      await withdrawTokens(amount);
    }
    if (txStatus === "success") {
      setAmount("");
    }
  };

  const maxAmount = activeTab === "stake" ? tokenBalance : stakedAmount;

  const isValidAmount =
    amount &&
    parseFloat(amount) > 0 &&
    parseFloat(amount) <= parseFloat(maxAmount);

  const getButtonText = () => {
    if (isLoading) return "Processing";

    if (activeTab === "stake") {
      if (needsApproval(amount)) {
        return "Approve & Stake";
      }

      return "Stake";
    }
    return "Withdraw";
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Stake / Withdraw</h2>
      </div>
      <div className="tabs">
        <button
          className={`tab ${activeTab === "stake" ? "active" : " "}`}
          onClick={() => setActiveTab("stake")}
        >
          Stake
        </button>
        <button
          className={`tab ${activeTab === "withdraw" ? "active" : " "}  `}
          onClick={() => setActiveTab("withdraw")}
        >
          Withdraw
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            {activeTab === "stake" ? "Amount to stake" : "Amount to withdraw"}
          </label>

          <input
            type="number"
            className="form-input"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="any"
            disabled={isLoading}
          />

          <div className="input-helper">
            <span>Available: {parseFloat(maxAmount).toFixed(4)} STK</span>

            <button
              type="button"
              className="max-btn"
              onClick={handleMax}
              disabled={isLoading}
            >
              Max
            </button>

            <button
              type="submit"
              className={`btn btn-full ${
                activeTab === "stake" ? "btn-primary" : "btn-secondary"
              }`}
              disabled={!isValidAmount || isLoading}
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </form>

      {txStatus && <div className={`tx-status ${txStatus}`}>{txMessage}</div>}

      <div>
        {activeTab === "stake" ? (
          <p>Stake your STK tokens to earn rewards</p>
        ) : (
          <p>Withdraw your staked tokens at any time</p>
        )}
      </div>
    </div>
  );
};

export default StakingForm;
