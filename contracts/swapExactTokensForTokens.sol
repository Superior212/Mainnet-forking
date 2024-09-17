// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IERC20.sol";

contract SwapExactTokens {
    address public uniSwapRouter;
    address public owner;
    uint public swapCount;

    constructor(address _uniSwapRouter) {
        uniSwapRouter = _uniSwapRouter;
        owner = msg.sender;
    }

    function handleSwapTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external {
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        require(
            IERC20(path[0]).approve(uniSwapRouter, amountIn),
            "Approve failed"
        );
        IUniswapV2Router02(uniSwapRouter).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            to,
            deadline
        );

        swapCount += 1;
    }
}
