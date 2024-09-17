import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("UseSwap", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployUseSwap() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    // Contracts are deployed using the first signer/account by default
    const [owner] = await hre.ethers.getSigners();

    const UseSwap = await hre.ethers.getContractFactory("UseSwap");
    const useSwap = await UseSwap.deploy(ROUTER_ADDRESS);

    return { useSwap, owner, ROUTER_ADDRESS };
  }

  describe("Deployment", function () {
    it("Should get the right Router Address", async function () {
      const { useSwap, ROUTER_ADDRESS } = await loadFixture(deployUseSwap);

      const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
      const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

      await helpers.impersonateAccount(TOKEN_HOLDER);
      const impersonatedSigner = await hre.ethers.getSigner(TOKEN_HOLDER);

      const amountOut = hre.ethers.parseUnits("20", 18);
      const amountInMax = hre.ethers.parseUnits("1000", 6);

      // contracts
      const USDC_Contract = await hre.ethers.getContractAt(
        "IERC20",
        USDC,
        impersonatedSigner
      );
      const bal = USDC_Contract.balanceOf(TOKEN_HOLDER);
      console.log("Balance: ", bal);

      const DAI_Contract = await hre.ethers.getContractAt("IERC20", DAI);

      // deadline
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

      // Approval
      await USDC_Contract.approve(useSwap, amountInMax);

      const tnx = await useSwap
        .connect(impersonatedSigner)
        .handleSwap(
          amountOut,
          amountInMax,
          [USDC, DAI],
          TOKEN_HOLDER,
          deadline
        );
      tnx.wait();

      expect(await useSwap.uniSwapRouter()).to.equal(ROUTER_ADDRESS);
      expect(await useSwap.swapCount()).to.equal(1);
    });
  });
});
