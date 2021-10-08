// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import './ERC20.sol';
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract RUSD is ERC20 {

    using SafeMath for uint;

    string public name;
    string public symbol;
    uint8 public decimals;

    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowances;

    constructor(uint tokenSupply, string memory tokenName, string memory tokenSymbol, uint8 tokenDecimals) {
        _totalSupply = tokenSupply;
        
        name = tokenName;
        symbol = tokenSymbol;
        decimals = tokenDecimals;

        balances[msg.sender] = _totalSupply;
    }

    function balanceOf(address accountAddress) public override view returns (uint) {
        return balances[accountAddress];
    }

    function allowance(address owner, address spender) public override view returns (uint) {
        return allowances[owner][spender];
    }

    function transfer(address recipient, uint amount) public override returns (bool) {
        require(balances[msg.sender] >= amount);

        balances[msg.sender] = balances[msg.sender].sub(amount);
        balances[recipient] = balances[recipient].add(amount);
        emit Transfer(msg.sender, recipient, amount);

        return true;
    }

    function approve(address spender, uint tokenAmount) public override returns (bool) {
        require(balances[msg.sender] >= tokenAmount);

        allowances[msg.sender][spender] = tokenAmount;
        emit Approval(msg.sender, spender, tokenAmount);

        return true;
    }

    function transferFrom(address sourceAddress, address destinationAddress, uint tokenAmount) public override returns (bool) {
        require(balances[sourceAddress] >= tokenAmount);
        require(allowance(sourceAddress, msg.sender) >= tokenAmount);

        balances[sourceAddress] = balances[sourceAddress].sub(tokenAmount);
        balances[destinationAddress] = balances[destinationAddress].add(tokenAmount);

        emit Transfer(sourceAddress, destinationAddress, tokenAmount);

        return true;
    }
}