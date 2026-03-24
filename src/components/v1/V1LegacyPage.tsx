'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAccount, useChainId, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { ETFOverview } from '@/components/ETFOverview'
import { MyHoldings } from '@/components/MyHoldings'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { TradePanel } from '@/components/TradePanel'
import { Toast, type ToastType } from '@/components/Toast'
import { useBlockETFData } from '@/hooks/useBlockETF'
import { blockETFCoreABI, etfRouterABI } from '@/lib/contracts/abis'
import { getContractAddress, getSupportedChainId } from '@/lib/contracts/addresses'

export function V1LegacyPage() {
  const { address, isConnected } = useAccount()
  const chainId = getSupportedChainId(useChainId())
  const queryClient = useQueryClient()
  const { writeContractAsync } = useWriteContract()
  const { assets, totalValue, totalSupply, shareValue, etfName, etfSymbol } = useBlockETFData()
  const etfCoreAddress = getContractAddress(chainId, 'blockETFCore')
  const routerAddress = getContractAddress(chainId, 'etfRouter')

  const { data: feeInfoData } = useReadContract({
    address: etfCoreAddress,
    abi: blockETFCoreABI,
    functionName: 'getFeeInfo',
  })

  const [showToast, setShowToast] = useState(false)
  const [toastType, setToastType] = useState<ToastType>('loading')
  const [toastMessage, setToastMessage] = useState('')
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>()
  const [isProcessing, setIsProcessing] = useState(false)

  const { isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash: lastTxHash,
  })

  useEffect(() => {
    if (!isSuccess || !lastTxHash) return

    setToastType('success')
    setToastMessage('Transaction confirmed successfully.')
    setIsProcessing(false)
    void queryClient.refetchQueries()
  }, [isSuccess, lastTxHash, queryClient])

  useEffect(() => {
    if (!isError || !lastTxHash) return

    setToastType('error')
    setToastMessage(error instanceof Error ? error.message : 'Transaction failed')
    setIsProcessing(false)
  }, [error, isError, lastTxHash])

  async function handleInvest(shares: bigint, maxUSDT: bigint) {
    if (!address) return

    setShowToast(true)
    setToastType('loading')
    setToastMessage('Minting V1 ETF shares...')
    setIsProcessing(true)

    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 600)
      const hash = await writeContractAsync({
        address: routerAddress,
        abi: etfRouterABI,
        functionName: 'mintExactShares',
        args: [shares, maxUSDT, deadline],
        gas: 1_500_000n,
      })
      setLastTxHash(hash)
    } catch (transactionError) {
      setToastType('error')
      setToastMessage(transactionError instanceof Error ? transactionError.message : 'Transaction failed')
      setIsProcessing(false)
    }
  }

  async function handleRedeem(shares: bigint, minUSDT: bigint) {
    if (!address) return

    setShowToast(true)
    setToastType('loading')
    setToastMessage('Redeeming V1 ETF shares...')
    setIsProcessing(true)

    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 600)
      const hash = await writeContractAsync({
        address: routerAddress,
        abi: etfRouterABI,
        functionName: 'burnToUSDT',
        args: [shares, minUSDT, deadline],
        gas: 1_500_000n,
      })
      setLastTxHash(hash)
    } catch (transactionError) {
      setToastType('error')
      setToastMessage(transactionError instanceof Error ? transactionError.message : 'Transaction failed')
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#0f172a_0%,#020617_100%)] text-white">
      <Toast
        isOpen={showToast}
        type={toastType}
        message={toastMessage}
        txHash={lastTxHash}
        chainId={chainId}
        onClose={() => setShowToast(false)}
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-amber-300/20 bg-amber-400/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-amber-100/80">Legacy Route</div>
              <h1 className="mt-2 text-3xl font-semibold text-white">BlockETF V1</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                This page is preserved for historical access and existing users. New product development continues on V2.
              </p>
            </div>
            <Link href="/" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950">
              Go to V2
            </Link>
          </div>
        </section>

        <ETFOverview
          sharePrice={shareValue}
          totalValue={totalValue}
          totalSupply={totalSupply}
          assets={assets}
          etfName={etfName}
          etfSymbol={etfSymbol}
          feeInfo={feeInfoData}
        />

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <TradePanel
            isConnected={isConnected}
            onInvest={handleInvest}
            onRedeem={handleRedeem}
            onShowToast={(type, message, hash) => {
              setShowToast(true)
              setToastType(type)
              setToastMessage(message)
              if (hash) setLastTxHash(hash)
            }}
            isParentProcessing={isProcessing}
          />
          <MyHoldings isConnected={isConnected} />
        </div>

        <SiteFooter />
      </div>
    </main>
  )
}
