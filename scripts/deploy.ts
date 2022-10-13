/* global ethers */
/* eslint prefer-const: "off" */

import { ContractReceipt, Transaction } from "ethers";
import { TransactionDescription, TransactionTypes } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { DiamondCutFacet } from "../typechain-types"
import { getSelectors, FacetCutAction } from "./libraries/diamond";

export let DiamondAddress: string;

//DIAMOND CONTRACT ADDRESS: 0x0e69BDA41D26214501C788B37ef997F044CAa4b5

export async function deployDiamond() {
  //const accounts = await ethers.getSigners();
  const contractOwner = "0x637CcDeBB20f849C0AA1654DEe62B552a058EA87";
  //const contractOwner = accounts[0];

  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed();
  console.log("DiamondCutFacet deployed:", diamondCutFacet.address);

  // deploy Diamond
  const Diamond = await ethers.getContractFactory("Diamond");
  const diamond = await Diamond.deploy(
    contractOwner,
    diamondCutFacet.address
  );
  await diamond.deployed();
  console.log("Diamond deployed:", diamond.address);

  // deploy DiamondInit
  // DiamondInit provides a function that is called when the diamond is upgraded to initialize state variables
  // Read about how the diamondCut function works here: https://eips.ethereum.org/EIPS/eip-2535#addingreplacingremoving-functions
  const DiamondInit = await ethers.getContractFactory("DiamondInit");
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.deployed();
  console.log("DiamondInit deployed:", diamondInit.address);

  // deploy facets
  console.log("");
  console.log("Deploying facets");
  const FacetNames = ["DiamondLoupeFacet", "OwnershipFacet", "Bank"];
  const cut = [];
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName);
    const facet = await Facet.deploy();
    await facet.deployed();
    console.log(`${FacetName} deployed: ${facet.address}`);
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet),
    });
  }

  console.log(cut);
  
  ////INTERRACTION
  const amount = ethers.utils.parseEther("0.01");
  const Bank = await ethers.getContractAt("Bank", cut[2].facetAddress);
  
  console.log(cut[2].facetAddress);
  console.log(Bank);

  const deposit = await Bank.deposit({value: amount});
  console.log("deposited here", deposit);
  

  
  const getContractBal = await Bank.getContractBal();
  console.log("Here is the contract balance", getContractBal);
  
  const getUserBal = await Bank.getUserBal();
  console.log("This is this user's balance", getUserBal);

  // const withdraw = await Bank.withdraw(amount);
  // console.log("Please, be nice", withdraw);

  // upgrade diamond with facets
  console.log("");
  console.log("Diamond Cut:", cut);
  const diamondCut = (await ethers.getContractAt(
    "IDiamondCut",
    diamond.address
  )) as DiamondCutFacet;
  let tx;
  let receipt: ContractReceipt;
  // call to init function
  let functionCall = diamondInit.interface.encodeFunctionData("init");
  tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall);
  console.log("Diamond cut tx: ", tx.hash);
  receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  console.log("Completed diamond cut");
  DiamondAddress = diamond.address;
}

// No need to generate any newer typings.
// DiamondCutFacet deployed: 0x4bC6D30bb5085c3F9196462f8A501ef0e9725039
// Diamond deployed: 0x1D183b27178C3Dc936b6991C51F69DdA8aAb0DF7
// DiamondInit deployed: 0x05C011639FF68Ce854372654060e2fD555a1e32d

// Deploying facets
// DiamondLoupeFacet deployed: 0x3bF58985103EC71a0f9E281b4291Ea169AAe86fE
// OwnershipFacet deployed: 0xed9CA72dC521603876E528DCccb4B9831f090074
// Bank deployed: 0xA90C30277D250a8cbdC26F67B3ab3661AC268b1c


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deployDiamond = deployDiamond;
