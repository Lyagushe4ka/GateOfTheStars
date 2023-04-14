const stg = [
    {
        chain: {
            name: 'BSC',
            id: 102,
            rpc: 'https://bsc.publicnode.com',
            router: '0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8',
        },
        USDT: {
            name: 'USDT',
            address: '0x55d398326f99059fF775485246999027B3197955',
            decimals: 18,
            poolId: 2
        }
    },
    {
        chain: {
            name: 'Avalanche',
            id: 106,
            rpc: 'https://1rpc.io/avax/c',
            router: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
        },
        USDC: {
            name: 'USDC',
            address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
            decimals: 6,
            poolId: 1
        },
        USDT: {
            name: 'USDT',
            address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
            decimals: 6,
            poolId: 2
        }
    },
    {
        chain: {
            name: 'Fantom',
            id: 112,
            rpc: 'https://fantom.publicnode.com',
            router: '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',
        },
        USDC: {
            name: 'USDC',
            address: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
            decimals: 6,
            poolId: 1
        },
    },
    {
        chain: {
            name: 'Polygon',
            id: 109,
            rpc: 'https://polygon.llamarpc.com',
            router: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
        },
        USDC: {
            name: 'USDC',
            address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            decimals: 6,
            poolId: 1
        },
        USDT: {
            name: 'USDT',
            address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            decimals: 6,
            poolId: 2
        }
    },
    {
        chain: {
            name: 'Arbitrum',
            id: 110,
            rpc: 'https://arb1.arbitrum.io/rpc',
            router: '0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614',
        },
        USDC: {
            name: 'USDC',
            address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
            decimals: 6,
            poolId: 1
        },
        USDT: {
            name: 'USDT',
            address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
            decimals: 6,
            poolId: 2
        }
    },
    {
        chain: {
            name: 'Optimism',
            id: 111,
            rpc: 'https://mainnet.optimism.io',
            router: '0xB0D502E938ed5f4df2E681fE6E419ff29631d62b',
        },
        USDC: {
            name: 'USDC',
            address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
            decimals: 6,
            poolId: 1
        }
    }
]

const erc20Abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
]

const routerAbi = [
    {
        "inputs": [{
            "internalType": "uint16",
            "name": "_dstChainId",
            "type": "uint16"
        }, {
            "internalType": "uint8",
            "name": "_functionType",
            "type": "uint8"
        }, {
            "internalType": "bytes",
            "name": "_toAddress",
            "type": "bytes"
        }, {
            "internalType": "bytes",
            "name": "_transferAndCallPayload",
            "type": "bytes"
        }, {
            "components": [{
                "internalType": "uint256",
                "name": "dstGasForCall",
                "type": "uint256"
            }, {
                "internalType": "uint256",
                "name": "dstNativeAmount",
                "type": "uint256"
            }, {
                "internalType": "bytes",
                "name": "dstNativeAddr",
                "type": "bytes"
            }],
            "internalType": "struct IStargateRouter.lzTxObj",
            "name": "_lzTxParams",
            "type": "tuple"
        }],
        "name": "quoteLayerZeroFee",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }, {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "uint16",
            "name": "_dstChainId",
            "type": "uint16"
        }, {
            "internalType": "uint256",
            "name": "_srcPoolId",
            "type": "uint256"
        }, {
            "internalType": "uint256",
            "name": "_dstPoolId",
            "type": "uint256"
        }, {
            "internalType": "address payable",
            "name": "_refundAddress",
            "type": "address"
        }, {
            "internalType": "uint256",
            "name": "_amountLD",
            "type": "uint256"
        }, {
            "internalType": "uint256",
            "name": "_minAmountLD",
            "type": "uint256"
        }, {
            "components": [{
                "internalType": "uint256",
                "name": "dstGasForCall",
                "type": "uint256"
            }, {
                "internalType": "uint256",
                "name": "dstNativeAmount",
                "type": "uint256"
            }, {
                "internalType": "bytes",
                "name": "dstNativeAddr",
                "type": "bytes"
            }],
            "internalType": "struct IStargateRouter.lzTxObj",
            "name": "_lzTxParams",
            "type": "tuple"
        }, {
            "internalType": "bytes",
            "name": "_to",
            "type": "bytes"
        }, {
            "internalType": "bytes",
            "name": "_payload",
            "type": "bytes"
        }],
        "name": "swap",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
]

module.exports = {
    stg,
    erc20Abi,
    routerAbi
}