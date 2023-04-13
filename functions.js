const Web3 = require("web3");
const fs = require("fs");
const { erc20Abi, routerAbi } = require("./objects");

const providers = {};

function getProvider(rpc) {
    if (rpc in providers) {
        return providers[rpc];
    } else {
        providers[rpc] = new Web3.providers.HttpProvider(rpc);
        return providers[rpc];
    }
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

function hasUsdt(object) {
    if ('USDT' in object) {
        return true;
    } else {
        return false;
    }
}

function parsePrivateKeys() {
    const data = fs.readFileSync('PrivateKeys.txt').toString();
    const keys = data.split('\n');
    return keys;
}

async function isEnoughBalance(wallet, tokenInstance, decimals, amount) {
    const balance = await tokenInstance.methods.balanceOf(wallet).call();
    return balance > (amount * 10 ** decimals) ? true : false;
}

async function isEnoughAllowance(token, wallet, router, provider) {
    const tokenInstance = getTokenInstance(token, provider);
    const balance = await tokenInstance.methods.balanceOf(wallet).call();
    const allowance = await tokenInstance.methods.allowance(wallet, router).call();
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

async function getQuoteFee(destChainId, wallet, router, provider) {
    const routerInstance = getRouterInstance(router, provider);
    const quote = await routerInstance.methods.quoteLayerZeroFee(
        destChainId,
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
    hasUsdt,
    parsePrivateKeys,
    isEnoughBalance,
    isEnoughAllowance,
    approveTokens,
    getQuoteFee,
    swap
};