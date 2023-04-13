const { stg } = require('./objects');
const colors = require('colors/safe');
const { getProvider, getWalletInstance, hasUsdt, parsePrivateKeys, isEnoughBalance, isEnoughAllowance, approveTokens, getQuoteFee, swap } = require('./functions');

async function main() {
    const keys = parsePrivateKeys();

    const web3 = getProvider(stg[2].rpc);
    console.log(colors.green(`Provider connected: ${stg[2].chainName}`));

    const account = getWalletInstance(keys[0], web3);
    console.log(colors.cyan(`Wallet connected: ${account.address}`));

    const amount = 100;

    if (!hasUsdt(stg[2])) {
        console.log(colors.red('No USDT in this chain'));
        return;
    }

    if (await isEnoughBalance(stg[2].USDT.address, account.address, web3, stg[2].decimals, amount)) {
        if (await isEnoughAllowance(stg[2].USDT.address, account.address, stg[2].router, web3)) {
            console.log(colors.green('USDT allowance is enough'));
        } else {
            const approve = await approveTokens(stg[2].USDT.name, stg[2].USDT.address, account.address, stg[2].router, web3);
            console.log(colors.green(`${stg[2].USDT.name} approved, hash: ${approve.transactionHash}`));
        }
    }

    const quote = await getQuoteFee(stg[3].chainId, account.address, stg[2].router, web3);
    console.log(colors.yellow(`Quote fee: ${quote}`));

    const swap = await swap(stg[2].chainId, stg[2].USDT.poolId, stg[3].USDC.poolId, account.address, stg[2].router, web3, amount, quote);
    console.log(colors.green(`Swap hash: ${swap.transactionHash}`));
}

main();