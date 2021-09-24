// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
  uint256 totalWaves;
  uint256 private seed;

  event NewWave(address indexed from, string message, uint256 timestamp);

  struct Wave {
    address waver;
    string message;
    uint256 timestamp;
  }
  Wave[] waves;

  mapping(address => uint256) public lastWavedAt;

  constructor() payable {
    console.log("Hey! I am a contract and I am smarter than you :)");
  }

  function wave(string memory _message) public returns (bool) {
    require(
      lastWavedAt[msg.sender] + 5 minutes < block.timestamp,
      "You need to wait 5min between waves."
    );
    lastWavedAt[msg.sender] = block.timestamp;

    totalWaves += 1;
    console.log("%s has waved with message: %s", msg.sender, _message);

    waves.push(Wave(msg.sender, _message, block.timestamp));

    emit NewWave(msg.sender, _message, block.timestamp);

    bool sentPrize = false;
    // generate random number to see if it'll have a prize
    uint256 randomNum = (block.difficulty + block.timestamp + seed) % 100;
    console.log("Random # generated: %s", randomNum);

    // set the current randomNum as the next seed
    seed = randomNum;

    if (randomNum < 50) {
      console.log("%s won prize!", msg.sender);
      uint256 prizeAmount = 0.0001 ether;
      require(
        prizeAmount <= address(this).balance,
        "Contract does not have enough balance."
      );
      (bool success, ) = (msg.sender).call{ value: prizeAmount }("");
      require(success, "Failed to send money from contract");
      sentPrize = true;
    }
    return sentPrize;
  }

  function getAllWaves() public view returns (Wave[] memory) {
    return waves;
  }

  function getTotalWaves() public view returns (uint256) {
    return totalWaves;
  }
}
