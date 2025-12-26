import React from "react";
import { useWeb3 } from "../context/Web3Context";

const ConnectWallet = () => {
  const { connectWallet, isConnecting, error, isMetaMaskInstalled } = useWeb3();

  return (
    <div className="connect-screen">
      <h2>Welcome to Staking dApp</h2>
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Consectetur
        veritatis provident eos similique repudiandae fugiat perferendis, rerum
        minus debitis vero dolorum soluta quas, sint, delectus odit optio
        corrupti recusandae earum.
      </p>

      {!isMetaMaskInstalled() ? (
        <>
          <p style={{ color: "#df008dff", marginBottom: "20px" }}>
            Metamask is not installed, please install it to continue
          </p>

          <button
            className="btn btn-secondary"
            onClick={() =>
              window.open("https://metamask.io/download", "_blank")
            }
          >
            Install Metamsk
          </button>
        </>
      ) : (
        <button
          className="btn btn-secondary"
          disabled={isConnecting}
          style={{ fontSize: "1.1rem", padding: "15px 40px" }}
        >
          {isConnecting ? "Connecting" : "Connect Wallet"}
        </button>
      )}

      <div style={{ marginTop: "50px", textAlign: "left", maxWidth: "400px" }}>
        <h3>Features</h3>
        <ul style={{ color: "#edd3d3ff", lineHeight: "2" }}>
          <li>Stake STK tokens and earn rewards</li>
          <li>No lock period - withdraw anytime</li>
          <li>Real-time reward calculation</li>
          <li>Secure smart contract</li>
          <li>Fee is zero</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectWallet;
