const main = async () => {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account: ", deployer.address);
  deployerBalance = (await deployer.getBalance()).toString();
  console.log("Deployer's account balance: ", deployerBalance);

  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.1"),
  });

  await waveContract.deployed();

  console.log("WavePortal address:", waveContract.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
