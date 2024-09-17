import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("SwapETHForExact", function () {
  async function deploySwapETHForExact() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const [owner] = await hre.ethers.getSigners();

    const SwapETHForExact = await hre.ethers.getContractFactory(
      "SwapETHForExact"
    );
    const swapETHForExact = await SwapETHForExact.deploy(ROUTER_ADDRESS);

    return { swapETHForExact, owner, ROUTER_ADDRESS };
  }

  describe("Swap", function () {
    it("Should perform a token swap", async function () {
      const { swapETHForExact, ROUTER_ADDRESS } = await loadFixture(
        deploySwapETHForExact
      );
      const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
      const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
      const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

      await helpers.impersonateAccount(TOKEN_HOLDER);
      const impersonatedSigner = await hre.ethers.getSigner(TOKEN_HOLDER);

      const WETH_Contract = await hre.ethers.getContractAt(
        "IERC20",
        WETH,
        impersonatedSigner
      );
      const amountIn = hre.ethers.parseEther("1"); // 1 WETH
      await WETH_Contract.approve(swapETHForExact, amountIn);

      const path = [WETH, DAI];
      const to = impersonatedSigner.address;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

      await swapETHForExact.connect(impersonatedSigner).handleSwapETHForExact(
        amountIn,
        0, // amountOutMin
        path,
        to,
        deadline
      );

      expect(await swapETHForExact.swapCount()).to.equal(1);
    });
  });
});
