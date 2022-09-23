
import { ContractReceipt, Transaction } from "ethers";
import { TransactionDescription, TransactionTypes } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { DiamondCutFacet } from "../typechain-types"
import { getSelectors, FacetCutAction } from "./libraries/diamond";

export let DiamondAddress: string;

export async function deployDiamond() {
// const CONTRACT_ADDRESS = "0xe7a28A901CF0F75CF467d54788781a27f043aD51";
const accounts = await ethers.getSigners();
const contractOwner = accounts[0];

console.log(contractOwner.address);


const amount = ethers.utils.parseEther("0.1");
const Bank = await ethers.getContractAt("Bank", "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707");

console.log(Bank);


return;
const withdraw = await Bank.withdraw(amount);
console.log("Please, be nice", withdraw);

const getContractBal = await Bank.getContractBal();
console.log("Here is the contract balance", getContractBal);

const getUserBal = await Bank.getUserBal();
console.log("This is this user's balance", getUserBal);


}

if (require.main === module) {
    deployDiamond()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }
  
  exports.deployDiamond = deployDiamond;
  