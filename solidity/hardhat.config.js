require("@openzeppelin/hardhat-upgrades");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.10",
  defaultNetwork: "hardhat",
  networks: {
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/e214bb6e68204076917bb259393df015",
      accounts: [
        "f13c468152d1fb350a974ef0d9f5196da082053d9d05efab061e28c32cbc6b08",
      ],
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  paths: {},
};
