import { ethers } from "ethers";
const { WeiPerEther } = ethers.constants;

export function toEth(wei) {
  return wei / WeiPerEther;
}

export function toWei(eth) {
  return parseInt(eth * WeiPerEther);
}
