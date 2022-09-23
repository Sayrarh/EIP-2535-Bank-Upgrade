/* global ethers */
/* eslint prefer-const: "off" */

import { ContractReceipt, Transaction } from "ethers";
import { TransactionDescription, TransactionTypes } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { DiamondCutFacet } from "../typechain-types"
import { getSelectors, FacetCutAction } from "./libraries/diamond";

export let DiamondAddress: string;

export async function deployDiamond() {
  const contractOwner = "0x637CcDeBB20f849C0AA1654DEe62B552a058EA87";
  const diamondCutAddress = "0x027925426941caBc7B7830b61327C18C80826ec1";
  const DiamondAddress = "0x0e69BDA41D26214501C788B37ef997F044CAa4b5";

  // deploy Upgrade facet
  const Upgrade = await ethers.getContractFactory("Upgrade");
  const upgrade = await Upgrade.deploy();

  await upgrade.deployed();
  console.log("Upgrade deployed", upgrade.address)
  const cut = [];

  cut.push({
    facetAddress: upgrade.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(upgrade),
  });

  console.log(cut);

  console.log("Diamond Cut:", cut);
  const diamondCut = (await ethers.getContractAt(
    "IDiamondCut",
    DiamondAddress
  )) as DiamondCutFacet;
  let tx;
  let receipt: ContractReceipt;

  const addressZero = "0x0000000000000000000000000000000000000000";
  // call to init function
  let functionCall = "0x";
  tx = await diamondCut.diamondCut(cut, addressZero, functionCall);
  console.log("Diamond cut tx: ", tx.hash);
  receipt = await tx.wait();
  
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  
  // upgrade diamond with facets
  console.log("");
  console.log("Diamond Cut:", cut);

}

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
