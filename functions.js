const Web3 = require("web3");
const fs = require("fs");
const colors = require("colors");
const { stg, erc20Abi, routerAbi } = require("./objects");

const providers = {};

function getProvider(rpc) {
    if (rpc in providers) {
        return providers[rpc];
    } else {
        providers[rpc] = new Web3(new Web3.providers.HttpProvider(rpc));
        return providers[rpc];
    }
}

function getTokenInstance(token, provider) {
    return new provider.eth.Contract(erc20Abi, token);
}

function getWalletInstance(PrivateKey, provider) {
    if (!provider || !provider.eth) {
        throw new Error('Invalid provider');
    }
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
    return BigInt(allowance) > BigInt(balance);
}

async function approveTokens(tokenName, tokenContract, wallet, router, provider) {
    const tokenInstance = getTokenInstance(tokenContract, provider);

    provider.eth.accounts.wallet.add(wallet);
    provider.eth.defaultAccount = wallet.address

    if (tokenName === "USDT") {
        const revokeGas = await tokenInstance.methods.approve(router, 0).estimateGas({ from: wallet.address });
        console.log(`Revoke gaslimit: ${revokeGas}`);

        const revoke = await tokenInstance.methods.approve(router, 0).send({ from: wallet.address, gas: revokeGas });
        console.log(colors.cyan(`${tokenName} revoked, hash: ${revoke.transactionHash}`));

        const approveGas = await tokenInstance.methods.approve(router, provider.utils.toBN('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')).estimateGas({ from: wallet.address });
        console.log(`Approve gaslimit: ${approveGas}`);

        const approve = await tokenInstance.methods.approve(router, provider.utils.toBN('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')).send({ from: wallet.address, gas: approveGas });
        return console.log(colors.green(`${tokenName} approved, hash: ${approve.transactionHash}`));
    } else {
        const approveGas = await tokenInstance.methods.approve(router, provider.utils.toBN('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')).estimateGas({ from: wallet.address });
        console.log(`Approve gaslimit: ${approveGas}`);

        const approve = await tokenInstance.methods.approve(router, provider.utils.toBN('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')).send({ from: wallet.address, gas: approveGas });
        return console.log(colors.green(`${tokenName} approved, hash: ${approve.transactionHash}`));
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
    return Math.floor(quote[0] / 10 * 12); // + 20% for gas
}

async function swap(dstChainId, poolId, dstPoolId, wallet, router, provider, amount, fee) {
    const routerInstance = getRouterInstance(router, provider);

    provider.eth.accounts.wallet.add(wallet);
    provider.eth.defaultAccount = wallet.address

    const minAmountOut = amount * 0.99; // - 1% for slippage

    const swapGas = await routerInstance.methods.swap(
        dstChainId,
        poolId,
        dstPoolId,
        wallet.address,
        amount,
        minAmountOut,
        { dstGasForCall: 0, dstNativeAmount: 0, dstNativeAddr: "0x" },
        wallet.address,
        [],
    ).estimateGas({ value: fee, from: wallet.address });

    console.log(`Swap gaslimit: ${swapGas}`);

    const swap = await routerInstance.methods.swap(
        dstChainId,
        poolId,
        dstPoolId,
        wallet.address,
        amount,
        minAmountOut,
        { dstGasForCall: 0, dstNativeAmount: 0, dstNativeAddr: "0x" },
        wallet.address,
        [],
    ).send({ value: fee, from: wallet.address, gas: swapGas });

    return console.log(colors.green(`Bridge transaction sent, hash: ${swap.transactionHash}`));
}

// randomize wallet from PrivateKeys.txt
function randomizeWallet(privateKeys) {
    const key = privateKeys[Math.floor(Math.random() * privateKeys.length)];
    return key;
}

// randomize chain and token to swap
async function randomizeChainAndToken(PrivateKey) {
    let counter = 0;
    while (true) {
        counter++;

        // if counter > 8, return undefined and stop the loop to choose another wallet
        if (counter > 8) {
            return { chain: undefined, token: undefined, account: undefined, amount: 0 };
        }

        const chain = Math.floor(Math.random() * stg.length);
        const provider = getProvider(stg[chain].chain.rpc);
        console.log(`Provider: ${provider}`)
        const account = getWalletInstance(PrivateKey, provider);

        const rndBool = Math.random() < 0.5;
        let token = rndBool ? stg[chain].USDC : stg[chain].USDT;

        if (token === undefined) {
            token = rndBool ? stg[chain].USDT : stg[chain].USDC;
        }
        
        const tokenInstance = getTokenInstance(token.address, provider);
        const balance = await tokenInstance.methods.balanceOf(account.address).call();

        if (balance > (50 * 10 ** token.decimals)) {
            const amount = Math.floor(balance / 10 ** token.decimals) * 10 ** token.decimals;
            return { chain: stg[chain].chain, token: token, account: account, amount: amount };
        } else {
            continue;
        }
    }
}

// randomize destination chain and token to swap that is not the same as departure chain
function randomizeDestChainAndToken(DepartureChainName) {

    while (true) {
        const chain = Math.floor(Math.random() * stg.length);
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