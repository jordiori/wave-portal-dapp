import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import './App.css';
import WavePortal from './utils/WavePortal.json';
import ClipLoader from "react-spinners/ClipLoader";

export default function App() {
  const [account, setAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  // check on etherscan:
  // https://rinkeby.etherscan.io/address/0xA87e753fEde401Ee54EcE39e20CEaA01C1e810d7
  const contractAddress = "0xA87e753fEde401Ee54EcE39e20CEaA01C1e810d7";
  const contractABI = WavePortal.abi;

  const checkIfWalletIsConnected = async () => {
    // check if we have access to window.ethereum
    const {ethereum} = window;
    if (!ethereum) {
      console.log("Make sure you have metamask!")
      return
    } else {
      console.log("Ethereum object is available!", ethereum)
    }

    // check if we're authorized to acces the user wallet
    ethereum.request({method: 'eth_accounts'})
    .then(accounts => {
      if (accounts.length != 0) {
        // get first authorized account
        const account = accounts[0];
        console.log("found authorized account: ", account);
        // store account
        setAccount(account);
        getAllWaves();
      } else {
        console.log("no authorized account found");
      }
    })
  }

  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get Metamask!")
    }

    ethereum.request({method: 'eth_requestAccounts'})
    .then(accounts => {
      console.log("Connected", accounts[0]);
      setAccount(accounts[0]);
    })
    .catch(err => console.log(err));
  }

  const getTotalWaves = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        return count.toNumber();
      } else {
        console.log("ethereum object does not exist!!!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllWaves = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();
        console.log(waves);
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            message: wave.message,
            timestamp: new Date(wave.timestamp * 1000) // multiplied by 1000 so that the argument is in ms, not seconds.
          });
        });

        setAllWaves(wavesCleaned);

        wavePortalContract.on("NewWave", (from, message, timestamp) => {
          console.log("NewWave", from, message, timestamp);

          setAllWaves(prevState => [...prevState, {
            address: from,
            message: message,
            timestamp: new Date(timestamp * 1000)
          }]);
        })
      } else {
        console.log("ethereum object does not exist!!!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const initCheck = async () => {
      checkIfWalletIsConnected();
      let count = await getTotalWaves();
      setTotalWaves(count);
    }
    initCheck();
  }, [account])


  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

    const waveTxn = await wavePortalContract.wave(message);
    console.log("Sending transaction... ", waveTxn.hash);
    setLoading(true);
    await waveTxn.wait();
    console.log("Transaction done! ", waveTxn.hash);
    setLoading(false);
  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I'm a smart contract and I'm smarter than you.
        You can wave to me and I'll do something cool (or not).
        </div>

        <div className="bio">
        I've already received: { totalWaves } 👋
        </div>

        {account ? (
          <div className="dataContainer">
            <textarea placeholder="Include some message with your wave..." onChange={e => setMessage(e.target.value)}></textarea>

            <button className="waveButton" onClick={wave}>
              Wave to me!
            </button>
            <div className="bio">
              <ClipLoader size={30} color={"#ffde34"} loading={loading} speedMultiplier={1} />
            </div>
            {allWaves.map((wave, index) => {
              return (
                <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding:"8px" }}>
                  <div>Address: {wave.address}</div>
                  <div>Message: {wave.message}</div>
                  <div>Time: {wave.timestamp.toString()}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <button className="waveButton" onClick={connectWallet}>
            Connect Metamask
          </button>
        )}  
      </div>
    </div>
  );
}
