const { Web3 } = require("web3");
const { erc20Abi, routerAbi } = require("./objects");


function getProvider(rpc) {
    return new Web3.providers.HttpProvider(rpc);
}

function getTokenInstance(token, provider) {
    return new provider.eth.Contract(erc20Abi, token);
}

function getWalletInstance(PrivateKey, provider) {
    return provider.eth.accounts.privateKeyToAccount(PrivateKey);
}

function getRouterInstance(router, provider) {
    return new provider.eth.Contract(routerAbi, router);
}

async function isEnoughAllowance(token, wallet, router, provider) {
    const tokenInstance = getTokenInstance(token, provider);
    const balance = await tokenInstance.methods.balanceOf(wallet).call();
    const allowance = await tokenInstance.methods.allowance(wallet.address, router).call();
    return allowance > balance ? true : false;
}

async function approveTokens(tokenName, tokenAdr, wallet, router, provider) {
    const tokenInstance = getTokenInstance(tokenAdr, provider);
    if (tokenName === "USDT") {
        const revoke = await tokenInstance.methods.approve(router, 0).send({ from: wallet });

        const approve = await tokenInstance.methods.approve(router, 2 ** 256 - 1).send({ from: wallet });
        return console.log('USDT approved, hash: ' + approve.transactionHash);
    } else {
        const approve = await tokenInstance.methods.approve(router, 2 ** 256 - 1).send({ from: wallet });
        return console.log(`${tokenName} approved, hash: ${approve.transactionHash}`);
    }
}

async function getQuoteFee(chainId, wallet, router, provider) {
    const routerInstance = getRouterInstance(router, provider);
    const quote = await routerInstance.methods.quoteLayerZeroFee(
        chainId,
        1,
        wallet,
        "0x",
        {
            dstGasForCall: 20000, // extra gas, if calling smart contract,
            dstNativeAmount: 0,   // amount of dust dropped in destination wallet
            dstNativeAddr: "0x",  // destination wallet for dust
        }
    ).call();
    return quote[0].mul(10).div(8); // + 20% for gas
}

async function swap(dstChainId, poolId, dstPoolId, wallet, router, provider, amount, fee) {
    const routerInstance = getRouterInstance(router, provider);

    const minAmountOut = amount * 0.99; // - 1% for slippage
    
    const swap = await routerInstance.methods.swap(
        dstChainId,
        poolId,
        dstPoolId,
        wallet,
        amount,
        minAmountOut,
        { dstGasForCall: 0, dstNativeAmount: 0, dstNativeAddr: "0x" },
        wallet,
        ""
    ).send({ value: fee, from: wallet });

    return console.log(`Swap transaction sent, hash: ${swap.transactionHash}`);
}


module.exports = {
    getProvider,
    getTokenInstance,
    getWalletInstance,
    getRouterInstance,
    isEnoughAllowance,
    approveTokens,
    getQuoteFee,
    swap
};