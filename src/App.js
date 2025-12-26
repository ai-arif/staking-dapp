import React from "react";
import { useWeb3 } from "./context/Web3Context";
import Header from "./components/Header";
import StatsCard from "./components/StatsCard";
import UserStats from "./components/UserStats";
import StakingForm from "./components/StakingForm";
import ConnectWallet from "./components/ConnectionWallet";

function App() {
  const { isConnected, isCorrectNetwork } = useWeb3();

  return (
    <div className="app">
      <Header />
      <ConnectWallet />
      <StatsCard />
      <StakingForm />
      <UserStats />
    </div>
  );
}

export default App;
