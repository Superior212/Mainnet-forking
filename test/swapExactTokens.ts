import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("SwapExactTokens", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploySwapExactTokens() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    // Contracts are deployed using the first signer/account by default
    const [owner] = await hre.ethers.getSigners();

    const SwapExactTokens = await hre.ethers.getContractFactory(
      "SwapExactTokens"
    );
    const swapExactTokens = await SwapExactTokens.deploy(ROUTER_ADDRESS);

    return { swapExactTokens, owner, ROUTER_ADDRESS };
  }

  describe("Deployment", function () {
    it("Should get the right Router Address", async function () {
      const { swapExactTokens, ROUTER_ADDRESS } = await loadFixture(
        deploySwapExactTokens
      );

      const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
      const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

      await helpers.impersonateAccount(TOKEN_HOLDER);
      const impersonatedSigner = await hre.ethers.getSigner(TOKEN_HOLDER);

      const amountIn = hre.ethers.parseUnits("100", 6);
      const amountOutMin = hre.ethers.parseUnits("80", 18);
      // deadline
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
      const path = [USDC, DAI]; // USDC -> DAI

      // contracts
      const USDC_Contract = await hre.ethers.getContractAt(
        "IERC20",
        USDC,
        impersonatedSigner
      );
      const bal = await USDC_Contract.balanceOf(TOKEN_HOLDER);
      console.log("Balance: ", bal);

      const DAI_Contract = await hre.ethers.getContractAt("IERC20", DAI);

      // Approval
      await USDC_Contract.approve(swapExactTokens, amountIn);

      const tnx = await swapExactTokens
        .connect(impersonatedSigner)
        .handleSwapTokens(
          amountIn,
          amountOutMin,
          path,
          impersonatedSigner.address,
          deadline
        );
      tnx.wait();

      expect(await swapExactTokens.uniSwapRouter()).to.equal(ROUTER_ADDRESS);
      expect(await swapExactTokens.swapCount()).to.equal(1);
    });
  });
});
