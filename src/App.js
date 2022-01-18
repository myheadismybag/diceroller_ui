import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import env from "react-dotenv";
import "./App.css";
import wavePortalAbi from "./utils/WavePortal.json";
import diceRollerAbi from "./utils/DiceRoller.json";


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const diceRollerContractAddress = `${env.DICEROLLER_CONTRACT_ADDRESS}`;
  const waveContractAddress = `${env.WAVEPORTAL_CONTRACT_ADDRESS}`;// "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9";
  const contractAddress = waveContractAddress;

  console.log('contractAddress: ' + contractAddress)
  /**
   * Create a variable here that references the abi content!
   */
  let contractABI = wavePortalAbi.abi; // diceRollerAbi.abi
  const diceRollerContractABI = diceRollerAbi.abi;
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }


  const wave2 = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(diceRollerContractAddress, diceRollerContractABI, signer);

        let count = await wavePortalContract.getAllUsersCount();
console.log('sdf: ' + count)
        console.log("Retrieved total wave count...", count.toNumber());

        // const waveTxn = await wavePortalContract.wave();
        // console.log("Mining...", waveTxn.hash);

        // await waveTxn.wait();
        // console.log("Mined -- ", waveTxn.hash);

        // count = await wavePortalContract.getTotalWaves();
        // console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Download the contract ABI from etherscan. Assuming the contract has been verified.
  // Can avoid this by storing ABI locally too. Both are implemented.
  const downloadABI = async () => {
    const url = `https://api-kovan.etherscan.io/api?module=contract&action=getabi&address=${env.WAVEPORTAL_CONTRACT_ADDRESS}&apikey=${env.ETHERSCAN_API}`
    console.log('abi url: ' + url);
    const response = await fetch(url)
    const r2 = await response.json()
    // console.log('response: ' + r2.result);
    return JSON.parse(r2.result);
  }
  
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        contractABI = await downloadABI();
        // contractABI = wavePortalAbi.abi
        // console.log( 'abi 1: ' + JSON.stringify(wavePortalAbi.abi) )
        // console.log( 'abi 2: ' + JSON.stringify( await downloadABI()) )
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log('sdf: ' + count)
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          Connect your Ethereum wallet and wave at me!
        </div>

        {currentAccount &&
          <button className="waveButton" onClick={wave}>
            Wave at Me
          </button>
        }

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}

export default App