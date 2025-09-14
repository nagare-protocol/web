export default [
  {
    type: "constructor",
    inputs: [{ name: "vault_", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "agreementBalance",
    inputs: [{ name: "agreementId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "agreements",
    inputs: [{ name: "agreementId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Agreement",
        components: [
          {
            name: "verifier",
            type: "address",
            internalType: "contract INagareVerifier",
          },
          {
            name: "contractInfo",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "totalSize",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "checkpointSize",
            type: "uint256[]",
            internalType: "uint256[]",
          },
          {
            name: "receiver",
            type: "address",
            internalType: "address",
          },
          { name: "provider", type: "address", internalType: "address" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "checkpoint",
    inputs: [
      { name: "agreementId", type: "uint256", internalType: "uint256" },
      {
        name: "checkpointId",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "auxiliaryData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isAgreementTerminated",
    inputs: [{ name: "agreementId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isCheckpointCompleted",
    inputs: [
      { name: "agreementId", type: "uint256", internalType: "uint256" },
      { name: "checkpointId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "startAgreement",
    inputs: [
      {
        name: "agreement",
        type: "tuple",
        internalType: "struct Agreement",
        components: [
          {
            name: "verifier",
            type: "address",
            internalType: "contract INagareVerifier",
          },
          {
            name: "contractInfo",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "totalSize",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "checkpointSize",
            type: "uint256[]",
            internalType: "uint256[]",
          },
          {
            name: "receiver",
            type: "address",
            internalType: "address",
          },
          { name: "provider", type: "address", internalType: "address" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "terminate",
    inputs: [
      { name: "agreementId", type: "uint256", internalType: "uint256" },
      { name: "auxiliaryData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "vault",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IERC4626" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AgreementStarted",
    inputs: [
      {
        name: "agreementId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AgreementTerminated",
    inputs: [
      {
        name: "agreementId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CheckpointCompleted",
    inputs: [
      {
        name: "agreementId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "checkpointId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "AgreementAlreadyTerminated", inputs: [] },
  { type: "error", name: "CheckpointAlreadyCompleted", inputs: [] },
  { type: "error", name: "CheckpointVerificationFailed", inputs: [] },
  { type: "error", name: "InvalidAgreement", inputs: [] },
  { type: "error", name: "InvalidCheckpoint", inputs: [] },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
  },
  { type: "error", name: "TerminationVerificationFailed", inputs: [] },
] as const;
