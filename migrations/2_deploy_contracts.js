const RUSD = artifacts.require("RUSD");

const tokenDecimals = new web3.utils.BN(10).pow(new web3.utils.BN(18));
const RUSDSupply = new web3.utils.BN(100000).mul(tokenDecimals);
  
module.exports = function (deployer) {
  deployer.deploy(RUSD, RUSDSupply, "RosUSD", "RUSD", 18);
};