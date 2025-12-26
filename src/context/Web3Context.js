import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { ethers } from "ethers";
import { STAKING_ABI, STAKING_TOKEN_ABI } from "../utils/contracts";
import contractAddresses from "../utils/contractAddresses.json";

const Web3Context = createContext();

//Custom hook creating
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within Web3Provider");
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(null);
  const [error, setError] = useState(false);

  //contract instances

  const [stakeTokenContract, setStakeTokenContract] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);

  const isMetaMaskInstalled = () => {
    return (
      typeof window !== "undefined" && typeof window.ethereum !== "undefined"
    );
  };

  //initialize contracts
  const initializeContracts = useCallback(async (signerInstance) => {
    try {
      const stakeToken = new ethers.Contract(
        contractAddresses.stakeToken,
        STAKING_TOKEN_ABI,
        signerInstance
      );

      const staking = new ethers.Contract(
        contractAddresses.staking,
        STAKING_ABI,
        signerInstance
      );

      setStakeTokenContract(stakeToken);
      setStakingContract(staking);
    } catch (error) {
      console.error("Error initializing");
      setError("Failed to initialize contracts");
    }
  }, []);

  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError("please install metamsk");
      window.open("https://metamsk.io/download/", _blank);
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      //request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      //create provider and signer
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signerInstance = await browserProvider.getSigner();

      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(signerInstance);
      setAccount(accounts[0]);
      setChainId(network.chainId.toString());

      //initialize contracts with signer
      await initializeContracts(signerInstance);

      console.log("Wallet connected: ", accounts[0]);
    } catch (error) {
      console.error("error connection wallet: ", error);
      if (error.code === 4001) {
        setError("Connection rejected by user");
      } else {
        setError("Failed to connect wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setStakeTokenContract(null);
    setStakingContract(null);
    setError(null);
  };

  const switchNetwork = async (targetChainId = "31337") => {
    if (!window.ethereum) return;

    const chaindIdHex = `0x${parseInt(targetChainId).toString(16)}`;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chaind: chaindIdHex }],
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  //formatting address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);

        if (signer) {
          initializeContracts(singer);
        }
      }
    };

    const handleChainChanged = (newChainId) => {
      setChainId(parseInt(newChainId, 16).toString());
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length > 0) {
        connectWallet();
      }
    });

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const isCorrectNetwork = chainId === contractAddresses.chainId;

  const value = {
    //state
    provider,
    signer,
    account,
    chainId,
    isConnecting,
    error,
    isConnected: !!account,
    isCorrectNetwork,

    //contracts
    stakeTokenContract,
    stakingContract,

    //functions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    formatAddress,
    isMetaMaskInstalled,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
