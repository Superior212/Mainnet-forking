import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("LiquiditySwap", function () {
  async function deployLiquiditySwap() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    // Contracts are deployed using the first signer/account by default
    const [owner] = await hre.ethers.getSigners();

    const LiquiditySwap = await hre.ethers.getContractFactory("LiquiditySwap");
    const liquiditySwap = await LiquiditySwap.deploy(ROUTER_ADDRESS);

    return { liquiditySwap, owner, ROUTER_ADDRESS };
  }

  describe("Deployment", function () {
    it("Should get the right Router Address", async function () {
      const { liquiditySwap, ROUTER_ADDRESS } = await loadFixture(
        deployLiquiditySwap
      );

      const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
      const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

      await helpers.impersonateAccount(TOKEN_HOLDER);
      const impersonatedSigner = await hre.ethers.getSigner(TOKEN_HOLDER);

      const amountUSDC = hre.ethers.parseUnits("1000", 6);
      const amountDAI = hre.ethers.parseUnits("100", 18);
      const amountUSDCMin = hre.ethers.parseUnits("50", 6);
      const amountDAIMin = hre.ethers.parseUnits("50", 18);
      // deadline
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

      // contracts
      const USDC_Contract = await hre.ethers.getContractAt(
        "IERC20",
        USDC,
        impersonatedSigner
      );
      const bal = await USDC_Contract.balanceOf(TOKEN_HOLDER);
      console.log("Balance: ", bal);

      const DAI_Contract = await hre.ethers.getContractAt("IERC20", DAI, impersonatedSigner);

      // Approval

      await USDC_Contract.approve(liquiditySwap, amountUSDC);
      await DAI_Contract.approve(liquiditySwap, amountDAI);

      const tnx = await liquiditySwap
        .connect(impersonatedSigner)
        .handleLiquidity(
          USDC,
          DAI,
          amountUSDC,
          amountDAI,
          amountUSDCMin,
          amountDAIMin,
          impersonatedSigner.address,
          deadline
        );
      tnx.wait();

      expect(await liquiditySwap.uniSwapRouter()).to.equal(ROUTER_ADDRESS);
      expect(await liquiditySwap.liquidityCount()).to.equal(1);
    });
  });
});
