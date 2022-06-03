import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const App = () => {
  /*
   * Just a state variable we use to store our user's public wallet.
   */
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState();
  const [message, setMessage] = useState("");
  const contractAddress = "0xaE45A9F605BA0c197eD0BCAA6c38459becf7964B";
  const contractABI = abi.abi;

  console.log(allWaves);

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
        const waveTxn = await wavePortalContract.wave(message);
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
        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();
        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        setAllWaves(wavesCleaned);

        console.log(allWaves);
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
  }, [allWaves]);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hello World!</div>

        <div className="bio">
          I'm Mike, and sooner than later I'll be a Solidity expert! <br />
          Send good vibes my way! Connect your Ethereum wallet to the Rinkeby
          network and wave at me!
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

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {allWaves
          ? allWaves.map((wave, index) => {
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
            })
          : null}
        {/* <h2 style={{ textAlign: "center" }}>
          {allWaves ? `Total Wave Count: ${allWaves}` : null}
        </h2> */}
      </div>
    </div>
  );
};

export default App;
