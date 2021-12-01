const OwnableContract = artifacts.require("Ownable");

const truffleAssert = require("truffle-assertions");
const constants = require('./constants/constants');

contract("Ownable Contract", async (accounts) => {
  let contractDeployer = accounts[0];
  let ownableContract;

  beforeEach(async () => {
    ownableContract = await OwnableContract.new({ from: contractDeployer });
  });

  describe("Deploy tests", () => {
    it("is deplyed", async () => {
      assert.ok(ownableContract.address);
    });

    it("owner property of the contract is set to an account that deployed the contract", async () => {
      let owner = await ownableContract.owner.call();
      assert.equal(owner, contractDeployer);
    });
  });

  describe("Ownership transfer:", () => {
    it("transfers ownership to the correct account", async () => {
      let desiredOwner = accounts[1];
      await ownableContract.transferOwnership(desiredOwner, {
        from: contractDeployer,
      });

      let curOwner = await ownableContract.owner.call();
      let expectedOwner = desiredOwner;

      assert.equal(curOwner, expectedOwner);
    });

    it('only current owner can transfer ownership', async () => {
      let transferOwnershipCaller = accounts[1];

      await truffleAssert.reverts(ownableContract.transferOwnership(accounts[1], {from: transferOwnershipCaller}));
      assert.notEqual(contractDeployer, transferOwnershipCaller);
    });

    it('cannot transfer ownership to zero address', async () => {
      await truffleAssert.reverts(ownableContract.transferOwnership(constants.kZeroAddress, {from: contractDeployer}));
    });
  });
});
