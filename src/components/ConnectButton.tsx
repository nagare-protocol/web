'use client'

import { usePrivy } from '@privy-io/react-auth'

export function ConnectButton() {
  const { ready, authenticated, user, login, logout } = usePrivy()

  if (!ready) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    )
  }

  if (authenticated && user) {
    return (
      <div className="flex flex-col gap-4 p-4 bg-green-100 rounded-lg">
        <div className="text-green-800">
          <p className="font-semibold">Connected!</p>
          {user.email && <p className="text-sm">Email: {user.email.address}</p>}
          {user.wallet && (
            <p className="text-sm">Wallet: {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}</p>
          )}
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Connect with Privy</h3>
      <button
        onClick={login}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
      >
        Login
      </button>
    </div>
  )
}