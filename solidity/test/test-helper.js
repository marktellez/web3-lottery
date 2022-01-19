let ethers, chai, expect, ZERO_ADDRESS;
(() => {
  ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  ethers = require("hardhat").ethers;
  chai = require("chai");
  expect = chai.expect;
  const { solidity } = require("ethereum-waffle");
  chai.use(solidity);
})();

module.exports = {
  ethers,
  expect,
  ZERO_ADDRESS,
};
