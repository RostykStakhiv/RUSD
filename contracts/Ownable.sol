// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

contract Ownable {
    address public owner;

    constructor() {
        owner = msg.sender;
    } 

    modifier OwnerRestricted() {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) OwnerRestricted public {
        require(newOwner != address(0));
        owner = newOwner;
    }
}