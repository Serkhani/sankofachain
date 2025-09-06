import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const externalContracts = {
  84532: { // Base Sepolia
    SankofaRegistrar: {
      address: "0x910DDfaf66627797fb7CD50e664568E84EBb0E1a",
      abi: [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_registry",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "string",
              "name": "label",
              "type": "string"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "node",
              "type": "bytes32"
            }
          ],
          "name": "NameRegistered",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "label",
              "type": "string"
            }
          ],
          "name": "available",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "chainId",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "coinType",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "registry",
          "outputs": [
            {
              "internalType": "contract IL2Registry",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "label",
              "type": "string"
            }
          ],
          "name": "registerBasic",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "label",
              "type": "string"
            },
            {
              "components": [
                {
                  "internalType": "string",
                  "name": "key",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "value",
                  "type": "string"
                }
              ],
              "internalType": "struct TextRecord[]",
              "name": "userDetails",
              "type": "tuple[]"
            }
          ],
          "name": "register",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "label",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "register",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
    },
    ENSRegistry: {
      address: "0x7bd23bf843970570908f2fdbfeb42fcf0da32bd5",
      abi: [
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "node",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "label",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "NewOwner",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "node",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "resolver",
              "type": "address"
            }
          ],
          "name": "NewResolver",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "node",
              "type": "bytes32"
            }
          ],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "node",
              "type": "bytes32"
            }
          ],
          "name": "resolver",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "node",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "resolver",
              "type": "address"
            }
          ],
          "name": "setResolver",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "node",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "label",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "setSubnodeOwner",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
    },
  },
} as const;

export default externalContracts satisfies GenericContractsDeclaration;
