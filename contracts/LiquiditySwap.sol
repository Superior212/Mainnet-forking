// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IERC20.sol";

contract LiquiditySwap {
    address public uniSwapRouter;
    address public owner;
    uint public liquidityCount;

    constructor(address _uniSwapRouter) {
        uniSwapRouter = _uniSwapRouter;
        owner = msg.sender;
    }

    function handleLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity) {
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountADesired);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountBDesired);

        require(
            IERC20(tokenA).approve(uniSwapRouter, amountADesired),
            "Approve tokenA failed"
        );
        require(
            IERC20(tokenB).approve(uniSwapRouter, amountBDesired),
            "Approve tokenB failed"
        );

        (amountA, amountB, liquidity) = IUniswapV2Router02(uniSwapRouter)
            .addLiquidity(
                tokenA,
                tokenB,
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin,
                to,
                deadline
            );

        // Refund any unused tokens
        if (amountA < amountADesired) {
            IERC20(tokenA).transfer(msg.sender, amountADesired - amountA);
        }
        if (amountB < amountBDesired) {
            IERC20(tokenB).transfer(msg.sender, amountBDesired - amountB);
        }

        liquidityCount += 1;
        return (amountA, amountB, liquidity);
    }
}
