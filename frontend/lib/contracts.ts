export const MUSD_ADDRESS = process.env.NEXT_PUBLIC_MUSD_ADDRESS || "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503";

export const CONTRACT_ADDRESSES = {
  serviceRegistry: process.env.NEXT_PUBLIC_SERVICE_REGISTRY_ADDRESS || "",
  agentVault: process.env.NEXT_PUBLIC_AGENT_VAULT_ADDRESS || "",
  reviewSystem: process.env.NEXT_PUBLIC_REVIEW_SYSTEM_ADDRESS || "",
} as const;

// ABIs — paste full ABIs here after compilation, or import from artifacts
// For now, minimal ABIs for the functions we need in the frontend

export const AGENT_VAULT_ABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "setDailyLimit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_limit", type: "uint256" }],
    outputs: [],
  },
  {
    name: "approveOperator",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_operator", type: "address" }],
    outputs: [],
  },
  {
    name: "revokeOperator",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_operator", type: "address" }],
    outputs: [],
  },
  {
    name: "getVaultInfo",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_owner", type: "address" }],
    outputs: [
      { name: "balance", type: "uint256" },
      { name: "dailyLimit", type: "uint256" },
    ],
  },
  {
    name: "getOperatorSpent",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_operator", type: "address" },
    ],
    outputs: [
      { name: "spent", type: "uint256" },
      { name: "limit", type: "uint256" },
      { name: "resetTime", type: "uint256" },
    ],
  },
] as const;

export const SERVICE_REGISTRY_ABI = [
  {
    name: "register",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_name", type: "string" },
      { name: "_endpoint", type: "string" },
      { name: "_pricePerRequest", type: "uint256" },
      { name: "_metadataURI", type: "string" },
      { name: "_freeTierLimit", type: "uint256" },
      { name: "_stakeAmount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getAllActive",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "owner", type: "address" },
          { name: "name", type: "string" },
          { name: "endpoint", type: "string" },
          { name: "pricePerRequest", type: "uint256" },
          { name: "metadataURI", type: "string" },
          { name: "mezoStaked", type: "uint256" },
          { name: "freeTierLimit", type: "uint256" },
          { name: "isActive", type: "bool" },
          { name: "registeredAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getService",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_serviceId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "owner", type: "address" },
          { name: "name", type: "string" },
          { name: "endpoint", type: "string" },
          { name: "pricePerRequest", type: "uint256" },
          { name: "metadataURI", type: "string" },
          { name: "mezoStaked", type: "uint256" },
          { name: "freeTierLimit", type: "uint256" },
          { name: "isActive", type: "bool" },
          { name: "registeredAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getServicesByOwner",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_owner", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "owner", type: "address" },
          { name: "name", type: "string" },
          { name: "endpoint", type: "string" },
          { name: "pricePerRequest", type: "uint256" },
          { name: "metadataURI", type: "string" },
          { name: "mezoStaked", type: "uint256" },
          { name: "freeTierLimit", type: "uint256" },
          { name: "isActive", type: "bool" },
          { name: "registeredAt", type: "uint256" },
        ],
      },
    ],
  },
] as const;

export const REVIEW_SYSTEM_ABI = [
  {
    name: "getReviews",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_serviceId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "reviewer", type: "address" },
          { name: "serviceId", type: "uint256" },
          { name: "score", type: "uint8" },
          { name: "comment", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getAverageScore",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_serviceId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "rate",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_serviceId", type: "uint256" },
      { name: "_score", type: "uint8" },
      { name: "_comment", type: "string" },
    ],
    outputs: [],
  },
] as const;

export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
