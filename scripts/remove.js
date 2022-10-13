/* global ethers */
/* eslint prefer-const: "off" */

const { getSelectors, removeSelectors, FacetCutAction } = require('./libraries/diamond.ts')
// import {
//   getSelectors,
//   FacetCutAction,
//   removeSelectors,
// } from "../scripts/libraries/diamond";

async function deployDiamond () {
  const accounts = await ethers.getSigners()
  const contractOwner = accounts[0]

  const getDiamondInit = await ethers.getContractAt('DiamondInit', "0x05C011639FF68Ce854372654060e2fD555a1e32d")

  // deploy facets
  console.log('')
  console.log('Deploying facets')
  const FacetNames = [
    'Bank'
  ]
  const cut = []
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractAt("Bank", "0xA90C30277D250a8cbdC26F67B3ab3661AC268b1c")
    // const facet = await Facet.deploy()
    // await facet.deployed()
   // console.log(`${FacetName} deployed: ${facet.address}`)
    const functionsToKeep = ['deposit()']
    //const selectors = getSelectors(Facet).remove(functionsToKeep)
    const selectors = removeSelectors(getSelectors(Facet), functionsToKeep);

    // const functionsToKeep = [
    //   "test2Func1()",
    // ];
    // const selectors = removeSelectors(
    //   getSelectors(test2Facet),
    //   functionsToKeep
    // );
    // tx = await diamondCutFacet.diamondCut(
    //   [
    //     {
    //       facetAddress: ethers.constants.AddressZero,
    //       action: FacetCutAction.Remove,
    //       functionSelectors: selectors,
    //     },
    //   ],

    // selectors = removeSelectors(selectors, [
    //   "facets()",
    //   "diamondCut(tuple(address,uint8,bytes4[])[],address,bytes)",
    // ]);

    cut.push({
      facetAddress:  ethers.constants.AddressZero,
      action: FacetCutAction.Remove,
      functionSelectors: selectors
    })
  }

  // upgrade diamond with facets
  console.log('')
  console.log('Diamond Cut:', cut)
  const diamondCut = await ethers.getContractAt('IDiamondCut', "0x1D183b27178C3Dc936b6991C51F69DdA8aAb0DF7")
  let tx
  let receipt
  // call to init function
  let functionCall = getDiamondInit.interface.encodeFunctionData('init')
  tx = await diamondCut.diamondCut(cut, "0x05C011639FF68Ce854372654060e2fD555a1e32d", functionCall)
  console.log('Diamond cut tx: ', tx.hash)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }
  console.log('Completed diamond cut')
  //return diamond.address
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployDiamond = deployDiamond