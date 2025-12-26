import React from "react";
import { useWeb3 } from "../context/Web3Context";

const Header = () => {
  const {
    account,
    chainId,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    formatAddress,
    switchNetwork,
  } = useWeb3();

  const getNetworkName = (id) => {
    const networks = {
      1: "Ethereum",
      11155111: "Sepolia",
      31337: "Localhost",
    };
    return networks[id] || `Chain ${id}`;
  };

  return (
    <header className="header">
      <div className="logo">Staking dApp</div>

      <div className="wallet-info">
        {isConnected ? (
          <>
            <span
              className={`network-badge ${isCorrectNetwork ? "" : "wrong"}`}
            >
              {isCorrectNetwork ? getNetworkName(chainId) : "Wrong Network"}
            </span>

            {isCorrectNetwork && (
              <button
                className="btn btn-secondary"
                onClick={() => switchNetwork("31337")}
              >
                Switch Network
              </button>
            )}

            <span className="wallet-address">{formatAddress(account)}</span>

            <button className="btn btn-secondary" onClick={disconnectWallet}>
              Disconnect
            </button>
          </>
        ) : (
          <button
            className="btn btn-secondary"
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Conect Wallet"}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header
