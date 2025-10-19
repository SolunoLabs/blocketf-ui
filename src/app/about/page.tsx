'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainId } from 'wagmi';
import { useState } from 'react';

export default function AboutPage() {
  const chainId = useChainId();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left side: Logo + Desktop Navigation */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <span className="text-white font-bold text-lg sm:text-xl">B</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  BlockETF
                </h1>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden sm:flex space-x-6">
                <Link
                  href="/"
                  className="text-gray-400 hover:text-gray-300 font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
                >
                  About
                </Link>
                {chainId === 97 && (
                  <Link
                    href="/faucet"
                    className="text-gray-400 hover:text-gray-300 font-medium transition-colors"
                  >
                    Faucet 💧
                  </Link>
                )}
              </nav>
            </div>

            {/* Right side: Connect Button (Desktop) / Network + Wallet + Menu (Mobile) */}
            <div className="flex items-center gap-2">
              {/* Desktop Connect Button */}
              <div className="hidden sm:block">
                <ConnectButton />
              </div>

              {/* Mobile Network + Wallet Icons */}
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
                  const ready = mounted;
                  const connected = ready && account && chain;

                  return (
                    <div className="sm:hidden flex items-center gap-1">
                      {/* Network Button - only show when connected */}
                      {connected && chain && (
                        <button
                          onClick={openChainModal}
                          className="px-2 py-1 text-xs font-medium text-gray-300 hover:text-gray-100 bg-gray-800/50 hover:bg-gray-700/50 rounded-md transition-colors border border-gray-700/50"
                          aria-label="Switch Network"
                        >
                          {chain.name === 'BNB Smart Chain' ? 'BSC' :
                           chain.name === 'BNB Smart Chain Testnet' ? 'BSC Test' :
                           chain.name}
                        </button>
                      )}

                      {/* Wallet Button */}
                      <button
                        onClick={connected ? openAccountModal : openConnectModal}
                        className="p-2 text-gray-400 hover:text-gray-300 transition-colors relative"
                        aria-label="Wallet"
                      >
                        {connected && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                }}
              </ConnectButton.Custom>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 text-gray-400 hover:text-gray-300 transition-colors"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="sm:hidden fixed top-[73px] right-4 z-50 animate-in slide-in-from-right duration-200">
            <div className="bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-700/70 shadow-2xl p-3 w-auto">
              <nav className="flex flex-col space-y-2.5 items-end whitespace-nowrap">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-gray-300 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-700/50 text-right"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-blue-400 font-medium hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-700/50 text-right"
                >
                  About
                </Link>
                {chainId === 97 && (
                  <Link
                    href="/faucet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-400 hover:text-gray-300 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-700/50 text-right"
                  >
                    Faucet 💧
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            About BlockETF
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your gateway to diversified crypto investment on the blockchain
          </p>
        </div>

        {/* What is BlockETF */}
        <section className="mb-16">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700/50">
            <h2 className="text-3xl font-bold text-gray-100 mb-6 flex items-center">
              <span className="mr-3 text-4xl">🎯</span>
              What is BlockETF?
            </h2>
            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
              <p>
                <strong className="text-blue-400">BlockETF</strong> is a decentralized platform for on-chain index funds.
                It enables anyone to invest in diversified cryptocurrency portfolios through tokenized fund shares,
                all secured by smart contracts on the Binance Smart Chain.
              </p>
              <p>
                Unlike traditional ETFs that require brokers and custody services, BlockETF operates entirely on-chain.
                You maintain full custody of your assets while gaining exposure to diversified crypto portfolios with a single transaction.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-xl p-6 border border-blue-500/30">
                  <div className="text-3xl mb-3">🔒</div>
                  <h3 className="text-lg font-bold text-blue-300 mb-2">Non-Custodial</h3>
                  <p className="text-sm text-gray-400">100% on-chain, you control your assets at all times</p>
                </div>
                <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-xl p-6 border border-purple-500/30">
                  <div className="text-3xl mb-3">🔍</div>
                  <h3 className="text-lg font-bold text-purple-300 mb-2">Transparent</h3>
                  <p className="text-sm text-gray-400">All transactions and holdings verifiable on blockchain</p>
                </div>
                <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 rounded-xl p-6 border border-green-500/30">
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="text-lg font-bold text-green-300 mb-2">Efficient</h3>
                  <p className="text-sm text-gray-400">One transaction to invest in multiple assets</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Crypto Top 5 Index */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-indigo-500/30">
            <h2 className="text-3xl font-bold text-gray-100 mb-6 flex items-center">
              <span className="mr-3 text-4xl">🏆</span>
              Our First Product: Crypto Top 5 Index
            </h2>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                The <strong className="text-indigo-400">Crypto Top 5 Index</strong> is the flagship index fund on the BlockETF platform.
                It&rsquo;s a professionally managed, diversified portfolio that tracks the top 5 cryptocurrencies,
                giving you balanced exposure to the leading assets in the crypto market.
              </p>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">💡</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-300 mb-3 text-xl">How It Works</h4>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      When you buy Index shares, the fund uses your USDT to purchase the underlying cryptocurrencies according to the target allocation.
                      Your Index shares represent proportional ownership of all assets in the fund. As the underlying assets (BTCB, ETH, WBNB, XRP, SOL)
                      appreciate or depreciate, your share value changes accordingly. When you redeem, the fund sells the underlying assets and returns USDT to you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/60 rounded-xl p-6 border border-indigo-400/20">
                <h3 className="text-xl font-bold text-indigo-300 mb-2">Fund Composition</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Equal-weighted allocation across 5 leading cryptocurrencies:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold">BTCB</span>
                      <span className="text-gray-500 text-sm ml-2">(Bitcoin BEP2)</span>
                    </div>
                    <span className="text-indigo-400 font-bold">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold">ETH</span>
                      <span className="text-gray-500 text-sm ml-2">(Ethereum)</span>
                    </div>
                    <span className="text-indigo-400 font-bold">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold">WBNB</span>
                      <span className="text-gray-500 text-sm ml-2">(Wrapped BNB)</span>
                    </div>
                    <span className="text-indigo-400 font-bold">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold">XRP</span>
                      <span className="text-gray-500 text-sm ml-2">(Ripple)</span>
                    </div>
                    <span className="text-indigo-400 font-bold">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold">SOL</span>
                      <span className="text-gray-500 text-sm ml-2">(Solana)</span>
                    </div>
                    <span className="text-indigo-400 font-bold">20%</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <h4 className="font-bold text-blue-300 mb-1">Auto-Rebalancing</h4>
                      <p className="text-sm text-gray-400">
                        The fund automatically rebalances to maintain target weights, ensuring optimal diversification.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💎</span>
                    <div>
                      <h4 className="font-bold text-green-300 mb-1">Blue-Chip Focus</h4>
                      <p className="text-sm text-gray-400">
                        Invests only in established cryptocurrencies with proven track records and strong fundamentals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Use */}
        <section className="mb-16">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700/50">
            <h2 className="text-3xl font-bold text-gray-100 mb-8 flex items-center">
              <span className="mr-3 text-4xl">📖</span>
              How to Invest in Crypto Top 5 Index
            </h2>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/50">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-blue-400 mb-2">Connect Your Wallet</h3>
                  <p className="text-gray-300">
                    Click the &ldquo;Connect Wallet&rdquo; button in the top right corner and select your preferred wallet
                    (MetaMask, Trust Wallet, etc.). Make sure you&rsquo;re on the BSC network.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/50">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-purple-400 mb-2">Get USDT (if needed)</h3>
                  <p className="text-gray-300">
                    You&rsquo;ll need USDT to invest. If you&rsquo;re on testnet, use our Faucet to get free test USDT.
                    On mainnet, make sure you have USDT in your wallet.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-500/50">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-400 mb-2">Invest in the Index</h3>
                  <p className="text-gray-300 mb-3">
                    In the Trade Panel, select &ldquo;Invest&rdquo; mode, enter the amount of Crypto Top 5 Index shares you want to buy,
                    and click &ldquo;Invest Now&rdquo;. You&rsquo;ll need to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400 ml-4">
                    <li>Approve USDT spending (one-time, unlimited approval for convenience)</li>
                    <li>Confirm the investment transaction</li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/50">
                    4
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-orange-400 mb-2">Track Your Investment</h3>
                  <p className="text-gray-300">
                    View your holdings in the &ldquo;My Holdings&rdquo; section. You can see your Index share balance,
                    current value, and track the performance of each underlying asset in the Portfolio Composition table.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-pink-500/50">
                    5
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-pink-400 mb-2">Redeem When Ready</h3>
                  <p className="text-gray-300">
                    When you want to exit your position, switch to &ldquo;Redeem&rdquo; mode in the Trade Panel, enter the number of Index shares
                    to sell, and receive USDT back to your wallet. A 0.1% redemption fee applies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fee Structure */}
        <section className="mb-16">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700/50">
            <h2 className="text-3xl font-bold text-gray-100 mb-6 flex items-center">
              <span className="mr-3 text-4xl">💳</span>
              Fee Structure
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-xl p-6 border border-blue-500/30">
                <h3 className="text-xl font-bold text-blue-300 mb-3">Redemption Fee</h3>
                <p className="text-3xl font-bold text-blue-100 mb-2">0.1%</p>
                <p className="text-sm text-gray-400">
                  Applied when you redeem (sell) your Index shares. This fee helps maintain fund stability and covers gas costs.
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-purple-300 mb-3">Management Fee</h3>
                <p className="text-3xl font-bold text-purple-100 mb-2">0.5%</p>
                <p className="text-sm text-gray-400">
                  Annual fee for managing and rebalancing the fund. Accrued continuously and collected periodically.
                </p>
              </div>
            </div>
            <div className="mt-6 bg-gray-700/30 rounded-xl p-4">
              <p className="text-sm text-gray-300">
                <strong>No Investment Fee:</strong> There&rsquo;s no fee when you invest (buy shares) in the Crypto Top 5 Index!
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700/50">
            <h2 className="text-3xl font-bold text-gray-100 mb-8 flex items-center">
              <span className="mr-3 text-4xl">❓</span>
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <details className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30 cursor-pointer group">
                <summary className="text-lg font-bold text-blue-300 group-hover:text-blue-200 transition-colors">
                  What is slippage and why do I need to set it?
                </summary>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  Slippage is the difference between the expected price and the actual execution price. Due to price
                  fluctuations and fees, the final amount you receive/pay might differ slightly. Setting slippage tolerance
                  ensures your transaction won&rsquo;t fail if prices move within that range. We recommend 3-5% for most situations.
                </p>
              </details>

              <details className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30 cursor-pointer group">
                <summary className="text-lg font-bold text-blue-300 group-hover:text-blue-200 transition-colors">
                  Why do I need to approve tokens?
                </summary>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  Token approval is a security feature that allows our smart contract to spend your tokens on your behalf.
                  We use unlimited approval for convenience, so you only need to approve once. This is safe because our contracts
                  are audited and only execute transactions you explicitly initiate.
                </p>
              </details>

              <details className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30 cursor-pointer group">
                <summary className="text-lg font-bold text-blue-300 group-hover:text-blue-200 transition-colors">
                  How is the share price calculated?
                </summary>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  The share price is calculated by dividing the total value of all assets in the fund by the total number
                  of shares outstanding. As the underlying assets appreciate or depreciate, the share price adjusts accordingly.
                  This ensures fair pricing for all investors.
                </p>
              </details>

              <details className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30 cursor-pointer group">
                <summary className="text-lg font-bold text-blue-300 group-hover:text-blue-200 transition-colors">
                  Can I see my transaction history?
                </summary>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  Yes! Click the &ldquo;View Contract&rdquo; button at the top of the page to see the Crypto Top 5 Index token contract on BscScan.
                  You can also check your wallet&rsquo;s transaction history or view specific transaction details using the
                  transaction hash provided after each operation.
                </p>
              </details>

              <details className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30 cursor-pointer group">
                <summary className="text-lg font-bold text-blue-300 group-hover:text-blue-200 transition-colors">
                  What happens during rebalancing?
                </summary>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  The fund periodically rebalances to maintain target weights. This is done automatically by swapping assets
                  to restore the desired allocation. Rebalancing helps maintain diversification and can improve returns by
                  buying low and selling high automatically.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Risk Disclaimer */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-red-500/30">
            <h2 className="text-3xl font-bold text-red-300 mb-6 flex items-center">
              <span className="mr-3 text-4xl">⚠️</span>
              Risk Disclaimer
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                <strong>Smart Contract Risk:</strong> While our contracts are designed with security in mind, all smart
                contracts carry inherent risks. Please only invest what you can afford to lose.
              </p>
              <p>
                <strong>Market Risk:</strong> Cryptocurrency prices are highly volatile. The value of your investment
                can go up or down significantly in short periods.
              </p>
              <p>
                <strong>No Guarantees:</strong> Past performance does not guarantee future results. This is not financial
                advice. Please do your own research before investing.
              </p>
              <p className="text-red-400 font-semibold">
                By using the BlockETF platform and investing in the Crypto Top 5 Index, you acknowledge that you understand these risks
                and are solely responsible for your own investment decisions.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-bold text-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/50"
          >
            <span>Start Investing Now</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/80 border-t border-gray-800/50 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm space-y-2">
          <p className="text-gray-400">
            BlockETF - Decentralized ETF Platform | Built on BSC
          </p>
          <p className="text-xs text-gray-600">
            © 2025 Keegan Soluno Lab. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
