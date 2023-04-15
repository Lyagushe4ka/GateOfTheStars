const colors = require('colors/safe');
const { 
    getProvider,
    parsePrivateKeys,
    isEnoughAllowance,
    approveTokens,
    getQuoteFee,
    swap,
    randomizeWallet,
    randomizeChainAndToken,
    randomizeDestChainAndToken,
    retryPromise,
} = require('./functions');

async function main() {

    let rndKey;
    let chain;
    let token;
    let account;
    let amount = 0;

    // parse private keys from .txt file
    const keys = parsePrivateKeys();

    // retry promise of random wallet that has enough balance on random chain and token
    // returns:
    // chain - chain object
    // token - token object
    // account - wallet instance
    // amount - amount of tokens to swap with decimals
    while (rndKey === undefined || chain === undefined || token === undefined || account === undefined || amount === 0) {
        rndKey = randomizeWallet(keys);

        ({chain, token, account, amount} = await retryPromise(
            () => randomizeChainAndToken(rndKey),
        ));
    }

    console.log(colors.yellow(`Chain: ${chain.name}, Token: ${token.name}, Account: ${account.address}, Amount: ${amount / 10 ** token.decimals}`));

    // check if allowance is enough
    const enoughAllowance = await retryPromise(
        () => isEnoughAllowance(token.address, account.address, chain.router, getProvider(chain.rpc)),
    );
    console.log(enoughAllowance ? colors.green('Enough allowance') : colors.red('Not enough allowance'));

    // approve tokens if allowance is not enough
    if (!enoughAllowance) {
        const approve = await retryPromise(
            () => approveTokens(token.name, token.address, account, chain.router, getProvider(chain.rpc)),
        );
    }

    // returns random destination chain and token that is not the same as departure chain
    // destChain - chain object
    // destToken - token object
    const {destChain, destToken} = randomizeDestChainAndToken(chain.name);

    console.log(colors.yellow(`Destination chain: ${destChain.name}, Destination token: ${destToken.name}`));

    // get quote fee to bridge
    const quote = await retryPromise(
        () => getQuoteFee(destChain.id, account.address, chain.router, getProvider(chain.rpc)),
    );
    console.log(colors.green(`Quote fee: ${quote}`));

    // bridge tokens
    const bridge = await retryPromise(
        () => swap(
            destChain.id,
            token.poolId,
            destToken.poolId,
            account,
            chain.router,
            getProvider(chain.rpc),
            amount,
            quote,
        ),
    );

    // set random timeout from 10 to 60 minutes
    const timeout = Math.floor(Math.random() * 50 + 10) * 60 * 1000;
    console.log(colors.yellow(`Timeout: ${timeout / 1000 / 60} minutes`));
    console.log(colors.yellow('Waiting... \n'));
    setTimeout(main, timeout);
}

main();