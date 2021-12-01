const RUSDContract = artifacts.require("RUSD");

const truffleAssert = require("truffle-assertions");
const constants = require("./constants/constants");
const tokenDecimals = new web3.utils.BN(18);
const tokenDecimalsMultiplier = new web3.utils.BN(10).pow(tokenDecimals);

const tokenName = "RosUSD";
const tokenSymbol = "RUSD";

contract("RUSD Contract", async (accounts) => {
  let contractDeployer = accounts[0];
  let rusdContract;
  const tokenSupply = new web3.utils.BN(1000).mul(tokenDecimalsMultiplier);

  beforeEach(async () => {
    rusdContract = await RUSDContract.new(
      tokenSupply,
      tokenName,
      tokenSymbol,
      tokenDecimals,
      { from: contractDeployer }
    );
  });

  describe("Deploy tests", () => {
    it("is deplyed", async () => {
      assert.ok(rusdContract.address);
    });

    it("total supply is correct", async () => {
      let expectedTotalSupply = tokenSupply;
      let actualSupply = await rusdContract.totalSupply();

      assert.equal(expectedTotalSupply.eq(actualSupply), true);
    });

    it("token name is correct", async () => {
      let expectedTokenName = tokenName;
      let actualTokenName = await rusdContract.name();

      assert.equal(expectedTokenName, actualTokenName);
    });

    it("token symbol is correct", async () => {
      let expectedTokenSymbol = tokenSymbol;
      let actualTokenSymbol = await rusdContract.symbol();

      assert.equal(expectedTokenSymbol, actualTokenSymbol);
    });

    it("contract owner has all the tokens after deployment", async () => {
      let ownerBalance = await rusdContract.balanceOf(contractDeployer);
      let totalSupply = await rusdContract.totalSupply();

      assert.equal(ownerBalance.eq(totalSupply), true);
    });
  });

  describe("Balance tests:", () => {
    let user = accounts[1];

    it("contract owner's balance is correct", async () => {
      let ownersBalance = await rusdContract.balanceOf(contractDeployer);
      assert.equal(ownersBalance.eq(tokenSupply), true);
    });

    it("user who is not a contract owner should have balance equal to 0", async () => {
      let user = accounts[6];
      let userBalance = await rusdContract.balanceOf(user);
      assert.equal(userBalance.eq(new web3.utils.BN(0)), true);
      assert.notEqual(user, contractDeployer);
    });
  });

  describe("Allowance tests:", () => {
    let spender = accounts[1];
    let owner = contractDeployer;
    const amountToApprove = new web3.utils.BN(100).mul(tokenDecimalsMultiplier);

    it("token owner is able to approve another user to spend some of his tokens", async () => {
      await rusdContract.approve(spender, amountToApprove, { from: owner });

      let spenderAllowance = await rusdContract.allowance(owner, spender);
      let expectedSpenderAllowance = amountToApprove;

      assert.equal(spenderAllowance.eq(expectedSpenderAllowance), true);
    });

    it("only token owner can approve other user to spend some of his tokens", async () => {
      await truffleAssert.reverts(
        rusdContract.approve(spender, amountToApprove, { from: spender })
      );
    });

    it("token owner cannot approve more tokens than he owns", async () => {
      let ownerBalance = await rusdContract.balanceOf(owner);
      let amount = ownerBalance.add(new web3.utils.BN(1));
      await truffleAssert.reverts(
        rusdContract.approve(spender, amount, { from: owner })
      );
    });

    it("'Approval' event with correct values is emitted after user gets approved to spend tokens", async () => {
      let result = await rusdContract.approve(spender, amountToApprove, {
        from: owner,
      });
      truffleAssert.eventEmitted(
        result,
        "Approval",
        (event) => {
          assert.equal(event.owner, owner, "Owner value is incorrect");
          assert.equal(event.spender, spender, "Spender value is incorrect");
          assert.equal(
            event.tokenAmount.eq(amountToApprove),
            true,
            "Amount value is incorrect"
          );
          return true;
        },
        "Approval event should have correct values for owner, spender and amount"
      );
    });
  });

  describe("Transfer tests:", () => {
    let owner = contractDeployer;
    let receiver = accounts[1];
    const amountToTransfer = new web3.utils.BN(100).mul(
      tokenDecimalsMultiplier
    );

    it("owner is able to transfer his tokens to another user", async () => {
      let ownerBalanceBeforeTransfer = await rusdContract.balanceOf(owner);
      let receiverBalanceBeforeTransfer = await rusdContract.balanceOf(
        receiver
      );
      await rusdContract.transfer(receiver, amountToTransfer, { from: owner });

      let ownerBalanceAfterTransfer = await rusdContract.balanceOf(owner);
      let receiverBalanceAfterTransfer = await rusdContract.balanceOf(receiver);

      const expectedOwnerBalanceAfterTransfer =
        ownerBalanceBeforeTransfer.sub(amountToTransfer);
      const expectedReceiverBalanceAfterTransfer =
        receiverBalanceBeforeTransfer.add(amountToTransfer);

      assert.equal(
        ownerBalanceAfterTransfer.eq(expectedOwnerBalanceAfterTransfer),
        true,
        "Owner balance after transfer is incorrect"
      );
      assert.equal(
        receiverBalanceAfterTransfer.eq(expectedReceiverBalanceAfterTransfer),
        true,
        "Receiver balance after transfer is incorrect"
      );
    });

    it("owner cannot transfer more tokens than he owns", async () => {
      let ownerBalance = await rusdContract.balanceOf(owner);
      let amount = ownerBalance.add(new web3.utils.BN(1));
      await truffleAssert.reverts(
        rusdContract.transfer(receiver, amount, { from: owner })
      );
    });

    it("'Transfer' event is emitted after a successful transfer", async () => {
      let tx = await rusdContract.transfer(receiver, amountToTransfer, {
        from: owner,
      });
      truffleAssert.eventEmitted(
        tx,
        "Transfer",
        (ev) => {
          return _validateEvent(ev, owner, receiver, amountToTransfer);
        },
        "Transfer event should have correct values"
      );
    });

    describe("Delegated transfer tests:", () => {
      let spender = accounts[2];
      const approvedAmount = new web3.utils.BN(100).mul(
        tokenDecimalsMultiplier
      );

      it("approved spender can transfer tokens from owner that approved him", async () => {
        await rusdContract.approve(spender, approvedAmount, { from: owner });

        let initialOwnerBalance = await rusdContract.balanceOf(owner);
        let initialReceiverBalance = await rusdContract.balanceOf(receiver);
        let transferAmount = approvedAmount;

        await rusdContract.transferFrom(owner, receiver, transferAmount, {
          from: spender,
        });

        let afterTransferOwnerBalance = await rusdContract.balanceOf(owner);
        let afterTransferReceiverBalance = await rusdContract.balanceOf(
          receiver
        );

        let expectedOwnerBalance = initialOwnerBalance.sub(transferAmount);
        let expectedReceiverBalance =
          initialReceiverBalance.add(transferAmount);

        assert.equal(
          afterTransferOwnerBalance.eq(expectedOwnerBalance),
          true,
          "Owner balance is incorrect"
        );
        assert.equal(
          afterTransferReceiverBalance.eq(expectedReceiverBalance),
          true,
          "Receiver balance is incorrect"
        );
      });

      it("not approved user cannot transfer tokens from owner", async () => {
        let ownerBalance = await rusdContract.balanceOf(owner);
        assert.equal(ownerBalance.cmp(new web3.utils.BN(0)), 1); //Owner balance is greater than 0
        await truffleAssert.reverts(
          rusdContract.transferFrom(owner, receiver, ownerBalance, {
            from: receiver,
          })
        );
      });

      it("approved spender cannot transfer more than the owner's balance", async () => {
        let ownerBalance = await rusdContract.balanceOf(owner);
        let transferAmount = ownerBalance.add(new web3.utils.BN(1));
        await rusdContract.approve(spender, ownerBalance, { from: owner });
        await truffleAssert.reverts(
          rusdContract.transferFrom(owner, receiver, transferAmount, {
            from: spender,
          })
        );
      });

      it("'Transfer' event gets emitted after a successful transferFrom call", async () => {
        await rusdContract.approve(spender, approvedAmount, { from: owner });
        let tx = await rusdContract.transferFrom(
          owner,
          receiver,
          approvedAmount,
          { from: spender }
        );
        truffleAssert.eventEmitted(
          tx,
          "Transfer",
          (ev) => {
            return _validateEvent(ev, owner, receiver, approvedAmount);
          },
          "Transfer event should have correct values"
        );
      });
    });
  });

  function _validateEvent(
    emittedEvent,
    expectedSender,
    expectedRecipient,
    expectedAmount
  ) {
    assert.equal(
      emittedEvent.sender,
      expectedSender,
      "Sender value is incorrect"
    );
    assert.equal(
      emittedEvent.recipient,
      expectedRecipient,
      "Recipient value is incorrect"
    );
    assert.equal(
      emittedEvent.amount.eq(expectedAmount),
      true,
      "Amount value is incorrect"
    );
    return true;
  }
});
