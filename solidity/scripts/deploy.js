(async () => {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory("Lottery");
  const token = await Token.deploy(
    "0xdefCc1E3Bb41087D9AD4932608F6277aD3eDa533",
    300000000000000,
    1,
    2,
    1,
    1,
    "0xb5a9ede9a93528be3e12c5665c179c2dc0e2648aa6f1b1650f3715e56dad8bec"
  );

  console.log("Token address:", token.address);
  process.exit(0);
})();
