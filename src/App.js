import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import env from "react-dotenv";
import "./App.css";
import wavePortalAbi from "./utils/WavePortal.json";
import diceRollerAbi from "./utils/DiceRoller.json";


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [waveCount, setWaveCount] = useState("");
  const [mining, setMining] = useState(false);

  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const diceRollerContractAddress = `${env.DICEROLLER_CONTRACT_ADDRESS}`;
  const waveContractAddress = `${env.WAVEPORTAL_CONTRACT_ADDRESS}`;// "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9";
  const contractAddress = waveContractAddress;

  // console.log('contractAddress: ' + contractAddress)
  /**
   * Create a variable here that references the abi content!
   */
  // let contractABI = wavePortalAbi.abi; // diceRollerAbi.abi
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
        await populateContractUI();
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
    //saveABI(r2)
    return JSON.parse(r2.result);
  }
  
  const saveABI = async (content) => {
    // need to add an api to the server to perform the saving of abi file
    // all abi processes should be server side.
    // client just makes request to server.
  }

  const wave = async () => {
    try {
      const wavePortalContract = await contractInstance();
      const waveTxn = await wavePortalContract.wave();
      setMining(true);
      console.log("Mining...", waveTxn.hash);

      await waveTxn.wait();
      console.log("Mined -- ", waveTxn.hash);
      setMining(false);

      let count = await wavePortalContract.getTotalWaves();
      console.log("Retrieved total wave count...", count.toNumber());
      setWaveCount( count.toNumber() );
    } catch (error) {
      console.log(error)
    }
  }

  const populateContractUI = async() => {
    let contractABI = wavePortalAbi.abi;
    try {
      const wavePortalContract = await contractInstance();
      let count = await wavePortalContract.getTotalWaves();
      console.log('sdf: ' + count)
      console.log("Retrieved total wave count...", count.toNumber());
      setWaveCount( count.toNumber() );
    } catch (error) {
      console.log(error)
    }  
  }


  // 
  const contractInstance = async() => {
    let contract = null;
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        let contractABI = wavePortalAbi.abi;

        // download ABI from etherscan
        // if (contractABI === null) { 
        //   contractABI = await downloadABI();
        // }

        contract = new ethers.Contract(contractAddress, contractABI, signer);
      } else {
        console.log("Ethereum object doesn't exist!");
      }

      return contract;
    } catch (error) {
      console.log(error)
      throw error;
    }  
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    listenForAccountChange();
  }, [])


  // This logic is specific to MetaMask for now.
  const listenForAccountChange =() => {
    window.ethereum.on('accountsChanged', function (accounts) {
      // Time to reload your interface with accounts[0]!
      console.log('new account change: ' + JSON.stringify(accounts))
      setCurrentAccount(accounts[0]);
    })
  }

  const renderWavePortalUI =() => {
    return (
      <>
        <h3>Connected Account: {currentAccount}</h3>

        <h3>Times waved: {waveCount}</h3>

        {mining && 
          <span>Please wait. Mining...</span>
        }

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
      </>
    )
  }
  
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
          renderWavePortalUI()
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