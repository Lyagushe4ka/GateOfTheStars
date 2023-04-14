const Web3 = require("web3");
const fs = require("fs");
const { stg, erc20Abi, routerAbi } = require("./objects");

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

function parsePrivateKeys() {
    const data = fs.readFileSync('PrivateKeys.txt').toString();
    const keys = data.split('\n');
    return keys;
}

async function isEnoughAllowance(tokenContract, wallet, router, provider) {
    const tokenInstance = getTokenInstance(tokenContract, provider);
    const balance = await tokenInstance.methods.balanceOf(wallet).call();
    const allowance = await tokenInstance.methods.allowance(wallet, router).call();
    return allowance > balance ? true : false;
}

async function approveTokens(tokenName, tokenContract, wallet, router, provider) {
    const tokenInstance = getTokenInstance(tokenContract, provider);
    if (tokenName === "USDT") {
        const revoke = await tokenInstance.methods.approve(router, 0).send({ from: wallet });

        const approve = await tokenInstance.methods.approve(router, 2 ** 256 - 1).send({ from: wallet });
        return console.log(`${tokenName} approved, hash: ${approve.transactionHash}`);
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

// randomize wallet from PrivateKeys.txt
function randomizeWallet(privateKeys) {
    const key = privateKeys[Math.floor(Math.random() * privateKeys.length)];
    return key;
}

// randomize chain and token to swap
async function randomizeChainAndToken(PrivateKey) {
    const counter = 0;
    while (true) {
        counter++;

        // if counter > 8, return undefined and stop the loop to choose another wallet
        if (counter > 8) {
            return { chain: undefined, token: undefined, account: undefined, amount: 0 };
        }

        const chain = Math.floor(Math.random() * (stg.length - 1));
        const provider = getProvider(stg[chain].chain.rpc);
        const account = getWalletInstance(PrivateKey, provider);

        if (stg[chain].USDC.Contract === undefined) {
            const tokenInstance = getTokenInstance(stg[chain].USDT.address, provider);
            const balance = await tokenInstance.methods.balanceOf(account.address).call();
            if (balance > (50 * 10 ** stg[chain].USDT.decimals)) {
                const amount = Math.floor(balance / 10 ** stg[chain].USDT.decimals) * 10 ** stg[chain].USDT.decimals;
                return { chain: stg[chain].chain, token: stg[chain].USDT, account: account, amount: amount };
            } else {
                continue;
            }
        } else {
            const tokenInstance = getTokenInstance(stg[chain].USDC.address, provider);
            const balance = await tokenInstance.methods.balanceOf(account.address).call();
            if (balance > (50 * 10 ** stg[chain].USDC.decimals)) {
                const amount = Math.floor(balance / 10 ** stg[chain].USDC.decimals) * 10 ** stg[chain].USDC.decimals;
                return { chain: stg[chain].chain, token: stg[chain].USDC, account: account, amount: amount };
            } else {
                continue;
            }
        }
    }
}

// randomize destination chain and token to swap that is not the same as departure chain
function randomizeDestChainAndToken(DepartureChainName) {

    while (true) {
        const chain = Math.floor(Math.random() * (stg.length - 1));
        if (stg[chain].chain.name !== DepartureChainName) {
            if (stg[chain].USDC.name === undefined) {
                return { destChain: stg[chain].chain, destToken: stg[chain].USDT };
            } else {
                return { destChain: stg[chain].chain, destToken: stg[chain].USDC };
            }
        } else {
            continue;
        }
    }
}
            

// high order function to retry promise
function retryPromise(promise, retries = 5, delay = 1000) {
    return promise().catch(err => {
        if (retries > 1) {
            return new Promise(resolve => {
                setTimeout(() => resolve(retryPromise(promise, retries - 1, delay)), delay);
            });
        } else {
            return Promise.reject(err);
        }
    });
}



module.exports = {
    getProvider,
    getTokenInstance,
    getWalletInstance,
    getRouterInstance,
    parsePrivateKeys,
    isEnoughAllowance,
    approveTokens,
    getQuoteFee,
    swap,
    randomizeWallet,
    randomizeChainAndToken,
    randomizeDestChainAndToken,
    retryPromise,
};