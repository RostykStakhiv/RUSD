const RUSD = artifacts.require("RUSD");
  
module.exports = function (deployer) {
  deployer.deploy(RUSD, 1000000, "RosUSD", "RUSD", 1);
};