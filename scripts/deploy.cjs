const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const IdGenerator = await hre.ethers.getContractFactory('idGenerator');
  console.log(' Deploying idGenerator...');

  const contract = await IdGenerator.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(` Contract deployed at: ${address}`);

  // ✅ Save ABI + address for BOTH network IDs
  const abiPath = path.join(
    __dirname,
    '../my-app/src/contracts/idGenerator.json'
  );

  const artifact = await hre.artifacts.readArtifact('idGenerator');

  const output = {
    contractName: artifact.contractName,
    abi: artifact.abi,
    networks: {
      '1337': { address },
      '31337': { address },
      '11155111': { address },
    },
  };

  fs.writeFileSync(abiPath, JSON.stringify(output, null, 2));
  console.log(` ABI saved to my-app/src/contracts/idGenerator.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});