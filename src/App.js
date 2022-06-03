import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");
  const contractAddress = "0xfFE48276B130abb95Ae44f1f3533E95332029D29";
  const contractABI = abi.abi;

  console.log("allWaves:", allWaves);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.wave(message, {
          gasLimit: 300000,
        });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllWaves = async () => {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map((wave) => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getAllWaves();
  }, []);

  const displayAllWaves = allWaves.map((wave, index) => {
    return (
      <div className="waves" key={index}>
        <div>
          <strong>Address:</strong> {wave.address}
        </div>
        <div>
          <strong>Time:</strong> {wave.timestamp.toString()}
        </div>
        <div>
          <strong>Message:</strong> {wave.message}
        </div>
      </div>
    );
  });

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span>👋 Hello World!</span>
        </div>

        <div className="bio">
          I'm Mike, and soon I'll be a Solidity expert! <br />
          Send good vibes my way and wish me luck! <br />
          Connect your Ethereum wallet (Rinkeby network) and wave at me!
        </div>
        <div className="bio">
          <a href="https://github.com/personnamedmike">GitHub</a>
        </div>

        <div>
          <form>
            <input
              type="text"
              value={message}
              placeholder="Leave good vibes here..."
              onChange={(e) => {
                console.log(message);
                setMessage(e.target.value);
              }}
            />
          </form>
        </div>

        <button className="button-74" onClick={wave}>
          Wave at Me
        </button>
        <br />
        {!currentAccount ? (
          <button className="button-74" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : null}
        {allWaves ? displayAllWaves : null}
      </div>
    </div>
  );
};

export default App;
