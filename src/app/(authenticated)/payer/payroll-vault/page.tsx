"use client";

import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatEther, formatUnits, parseUnits } from "viem";
import { readContract, writeContract } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import NagareAgreementMorpho from "@/abi/NagareAgreementMorpho";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ERC20 ABI (minimal for balance and allowance)
const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// ERC4626 ABI (minimal for deposit/withdraw)
const ERC4626_ABI = [
  {
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    name: "deposit",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "owner", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

interface FundsData {
  allocated_funds: number;
  allocating_funds: number;
  agreements: (string | null)[];
}

export default function Page() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { address } = useAccount();

  const [fundsData, setFundsData] = useState<FundsData | null>(null);
  const [vaultBalance, setVaultBalance] = useState<bigint>(BigInt(0));
  const [usdcBalance, setUsdcBalance] = useState<bigint>(BigInt(0));
  const [unclaimedBalance, setUnclaimedBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`;
  const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
  const AGREEMENT_ADDRESS = process.env
    .NEXT_PUBLIC_AGREEMENT_ADDRESS as `0x${string}`;

  useEffect(() => {
    setBreadcrumbs([{ text: "Payroll Vaults" }]);
  }, [setBreadcrumbs]);

  // Fetch funds data from API
  const fetchFundsData = async () => {
    try {
      const response = await fetch("/api/funds");
      if (response.ok) {
        const data = await response.json();
        setFundsData(data);
        return data;
      }
    } catch (error) {
      console.error("Failed to fetch funds data:", error);
    }
    return null;
  };

  // Fetch token balances
  const fetchBalances = useCallback(async () => {
    if (!address) return;

    try {
      const [vaultBal, usdcBal] = await Promise.all([
        readContract(config, {
          address: VAULT_ADDRESS,
          abi: ERC4626_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
        readContract(config, {
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
      ]);

      setVaultBalance(vaultBal);
      setUsdcBalance(usdcBal);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    }
  }, [address, USDC_ADDRESS, VAULT_ADDRESS]);

  // Fetch unclaimed balances from agreements
  const fetchUnclaimedBalance = useCallback(
    async (agreements: (string | null)[]) => {
      if (!agreements.length) return;

      try {
        const balances = await Promise.all(
          agreements
            .filter((id): id is string => id !== null)
            .map((agreementId) =>
              readContract(config, {
                address: AGREEMENT_ADDRESS,
                abi: NagareAgreementMorpho,
                functionName: "agreementBalance",
                args: [BigInt(agreementId)],
              })
            )
        );

        const total = balances.reduce(
          (sum, balance) => sum + Number(formatEther(balance)),
          0
        );
        setUnclaimedBalance(total);
      } catch (error) {
        console.error("Failed to fetch unclaimed balance:", error);
      }
    },
    [AGREEMENT_ADDRESS]
  );

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const fundsData = await fetchFundsData();
      await fetchBalances();

      if (fundsData?.agreements) {
        await fetchUnclaimedBalance(fundsData.agreements);
      }

      setLoading(false);
    };

    if (address) {
      loadData();
    }
  }, [address, fetchBalances, fetchUnclaimedBalance]);

  // Deposit USDC to vault
  const handleDeposit = async () => {
    if (!address || !depositAmount) return;

    try {
      const amount = parseUnits(depositAmount, 6); // USDC has 6 decimals

      // First approve USDC
      await writeContract(config, {
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [VAULT_ADDRESS, amount],
      });

      // Then deposit to vault
      await writeContract(config, {
        address: VAULT_ADDRESS,
        abi: ERC4626_ABI,
        functionName: "deposit",
        args: [amount, address],
      });

      setDepositAmount("");
      await fetchBalances();
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  // Withdraw from vault
  const handleWithdraw = async () => {
    if (!address || !withdrawAmount) return;

    try {
      const amount = parseUnits(withdrawAmount, 6); // USDC has 6 decimals

      await writeContract(config, {
        address: VAULT_ADDRESS,
        abi: ERC4626_ABI,
        functionName: "withdraw",
        args: [amount, address, address],
      });

      setWithdrawAmount("");
      await fetchBalances();
    } catch (error) {
      console.error("Withdraw failed:", error);
    }
  };

  // Calculate values for charts
  const allocated = fundsData?.allocated_funds || 0;
  const allocating = fundsData?.allocating_funds || 0;
  const totalAllocated = allocated + allocating;
  const vaultBalanceUSD = Number(formatUnits(vaultBalance, 6));
  const availableBalance = vaultBalanceUSD - totalAllocated;

  // Generate last 7 days revenue data using 4.8% APY
  const generateLast7DaysRevenue = () => {
    const days = [];
    const dailyRate = 0.048 / 365; // 4.8% APY converted to daily rate

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

      // Calculate daily revenue based on vault balance and APY
      const dailyRevenue = vaultBalanceUSD * dailyRate * (7 - i);

      days.push({
        day: dayName,
        revenue: Number(dailyRevenue.toFixed(2)),
      });
    }

    return days;
  };

  const revenueData = generateLast7DaysRevenue();

  // Pie chart data with Math.max to handle negative values
  const pieChartData = [
    {
      name: "Available",
      value: Math.max(0, availableBalance),
      color: "#10B981",
    },
    {
      name: "Allocated (Unclaimed)",
      value: Math.max(0, unclaimedBalance),
      color: "#3B82F6",
    },
    {
      name: "Allocated (Claimed)",
      value: Math.max(0, allocated - unclaimedBalance),
      color: "#EF4444",
    },
  ].filter((item) => item.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Operations */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Vault Operations
            </h2>

            <div className="space-y-4">
              {/* Deposit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit USDC to Vault
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Amount in USDC"
                  />
                  <button
                    onClick={handleDeposit}
                    disabled={!depositAmount}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Deposit
                  </button>
                </div>
              </div>

              {/* Withdraw */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdraw from Vault
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Amount in USDC"
                  />
                  <button
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>

            {/* Balances */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Your Balances
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">USDC Balance:</span>
                  <span className="font-medium">
                    {(Number(formatUnits(usdcBalance, 8)) * 100).toFixed(2)}{" "}
                    USDC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vault Token Balance:</span>
                  <span className="font-medium">
                    {vaultBalanceUSD.toFixed(2)} nagareUSDC
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Overview
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Allocated Funds</span>
                <span className="text-lg font-semibold text-green-600">
                  ${allocated.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Unclaimed Amount</span>
                <span className="text-lg font-semibold text-blue-600">
                  ${unclaimedBalance.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available Balance</span>
                <span className="text-lg font-semibold text-gray-900">
                  ${availableBalance.toFixed(2)}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current APY</span>
                  <span className="text-lg font-semibold text-green-600">
                    4.8%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Revenue Trend
            </h2>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis
                    domain={["dataMin - 0.01", "dataMax + 0.01"]}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value).toFixed(4)}`,
                      "Revenue",
                    ]}
                    labelStyle={{ color: "#374151" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Allocation Pie Chart */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Fund Allocation
            </h2>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]}
                    labelStyle={{ color: "#374151" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) =>
                      `${value}: $${Number(entry?.payload?.value || 0).toFixed(
                        2
                      )}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
