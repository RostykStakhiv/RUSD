// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "./Ownable.sol";

abstract contract ERC20 is Ownable {
    uint internal _totalSupply;

    function totalSupply() public view returns (uint) {
        return _totalSupply;
    }

    function balanceOf(address accountAddress) public virtual view returns (uint);
    function allowance(address owner, address spender) public virtual view returns (uint);
    function transfer(address recipient, uint amount) public virtual returns (bool);
    function approve(address spender, uint tokenAmount) public virtual returns (bool);
    function transferFrom(address sourceAddress, address destinationAddress, uint tokenAmount) public virtual returns (bool);

    event Transfer(address indexed sender, address indexed recipient, uint amount);
    event Approval(address indexed owner, address indexed spender, uint tokenAmount);
}