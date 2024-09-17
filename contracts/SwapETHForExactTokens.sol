// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IERC20.sol";

contract SwapETHForExact {
    address public immutable uniSwapRouter;
    address public immutable owner;
    uint public swapCount;

    constructor(address _uniSwapRouter) {
        uniSwapRouter = _uniSwapRouter;
        owner = msg.sender;
    }

    function handleSwapETHForExact(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external {
        require(path.length >= 2, "Invalid path");

        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        require(
            IERC20(path[0]).approve(uniSwapRouter, amountIn),
            "Approve failed"
        );

        IUniswapV2Router02(uniSwapRouter)
            .swapExactTokensForTokens(
                amountIn,
                amountOutMin,
                path,
                to,
                deadline
            );

        swapCount += 1;
    }
}
