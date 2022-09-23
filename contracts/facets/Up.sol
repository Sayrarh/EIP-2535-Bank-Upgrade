// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/AppStorage.sol";

contract Upgrade{
    AppStorage internal a;

    error NoSufficientFunds();

    /// @dev function upgrade for user to be able to send out funds from their account to another address
    function sendOut(uint amountToSend, address to) external payable {
        if(amountToSend > a.balances[msg.sender]){
            revert NoSufficientFunds();
        }else{
            a.balances[msg.sender] -= amountToSend;
            payable(to).transfer(amountToSend);
        }
        
    }


    receive() external payable{}
}