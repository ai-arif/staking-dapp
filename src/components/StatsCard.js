import React from "react";
import { useStaking } from "../hooks/useStaking";

const StatsCard = () => {
  const { totalStaked, apy } = useStaking();

  const stats = [
    {
      label: "Total Value Locked",
      value: `${parseFloat(totalStaked).toLocaleString()} STK`,
      className: "",
    },
    {
      label: "Current APY",
      value: `${apy}%`,
      className: "success",
    },
    {
      label: "Lock Period",
      value: "None",
      className: "",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-label">{stat.label}</div>
          <div className="stat-value">{stat.value}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsCard;
