// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IERC20.sol";

contract UseSwap {
    address public uniSwapRouter;
    address public owner;
    uint public swapCount;

    constructor(address _uniSwapRouter) {
        uniSwapRouter = _uniSwapRouter;
        owner = msg.sender;
    }

    function handleSwap(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external {
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountInMax);
        require(
            IERC20(path[0]).approve(uniSwapRouter, amountInMax),
            "Approve failed"
        );
        IUniswapV2Router02(uniSwapRouter).swapTokensForExactTokens(
            amountOut,
            amountInMax,
            path,
            to,
            deadline
        );

        swapCount += 1;
    }
}
