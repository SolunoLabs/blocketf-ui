'use client'

import { useEffect, useMemo, useState } from 'react'
import { maxUint256, parseUnits, zeroAddress } from 'viem'
import { useQueryClient } from '@tanstack/react-query'
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { blockETFV2CoreABI, blockETFV2RouterABI, erc20ABI } from '@/lib/contracts/abis'
import { getV2Contracts, type Address } from '@/lib/contracts/addresses'

export type V2TradeMode = 'invest' | 'redeem'

const EMPTY_ADDRESS = zeroAddress as Address

export function useBlockETFV2Trade(etfAddress?: Address | null, mode: V2TradeMode = 'invest') {
  const chainId = useChainId()
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const { writeContractAsync } = useWriteContract()
  const contracts = getV2Contracts(chainId)
  const routerAddress = (contracts.router ?? EMPTY_ADDRESS) as Address
  const usdtAddress = contracts.usdt
  const targetETF = (etfAddress ?? EMPTY_ADDRESS) as Address
  const hasTradeConfig = !!contracts.router && !!etfAddress

  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState(3)
  const [pendingHash, setPendingHash] = useState<`0x${string}` | undefined>()
  const [transactionKind, setTransactionKind] = useState<'approve' | 'trade' | null>(null)

  const parsedAmount = useMemo(() => {
    try {
      return amount ? parseUnits(amount, 18) : 0n
    } catch {
      return 0n
    }
  }, [amount])

  const [lastInvestQuotedAmount, setLastInvestQuotedAmount] = useState<bigint>(0n)
  const [lastRedeemQuotedAmount, setLastRedeemQuotedAmount] = useState<bigint>(0n)

  const { data: investSharesQuote, isFetching: isFetchingInvestQuote } = useReadContract({
    address: routerAddress,
    abi: blockETFV2RouterABI,
    functionName: 'usdtToShares',
    args: [targetETF, parsedAmount],
    query: { enabled: hasTradeConfig && mode === 'invest' && parsedAmount > 0n },
  })

  const { data: redeemUsdtQuote, isFetching: isFetchingRedeemQuote } = useReadContract({
    address: routerAddress,
    abi: blockETFV2RouterABI,
    functionName: 'sharesToUsdt',
    args: [targetETF, parsedAmount],
    query: { enabled: hasTradeConfig && mode === 'redeem' && parsedAmount > 0n },
  })

  const { data: usdtBalance } = useReadContract({
    address: usdtAddress,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: shareBalance } = useReadContract({
    address: targetETF,
    abi: blockETFV2CoreABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!etfAddress },
  })

  const approvalToken = mode === 'invest' ? usdtAddress : targetETF

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: approvalToken,
    abi: erc20ABI,
    functionName: 'allowance',
    args: address ? [address, routerAddress] : undefined,
    query: { enabled: !!address && hasTradeConfig },
  })

  const requiredApprovalAmount = useMemo(
    () => (mode === 'invest' ? parsedAmount : parsedAmount),
    [mode, parsedAmount]
  )

  const needsApproval = useMemo(() => {
    if (!hasTradeConfig || !address || parsedAmount === 0n) return false
    if (allowance === undefined) return false
    return allowance < requiredApprovalAmount
  }, [address, allowance, hasTradeConfig, parsedAmount, requiredApprovalAmount])

  const insufficientBalance = useMemo(() => {
    if (!address || parsedAmount === 0n) return false
    if (mode === 'invest') return (usdtBalance ?? 0n) < parsedAmount
    return (shareBalance ?? 0n) < parsedAmount
  }, [address, mode, parsedAmount, shareBalance, usdtBalance])

  const minimumShares = useMemo(() => {
    if (!investSharesQuote) return 0n
    return (investSharesQuote * BigInt(100 - slippage)) / 100n
  }, [investSharesQuote, slippage])

  const minimumUsdt = useMemo(() => {
    if (!redeemUsdtQuote) return 0n
    return (redeemUsdtQuote * BigInt(100 - slippage)) / 100n
  }, [redeemUsdtQuote, slippage])

  useEffect(() => {
    if (mode !== 'invest' || parsedAmount === 0n || investSharesQuote === undefined || isFetchingInvestQuote) return
    setLastInvestQuotedAmount(parsedAmount)
  }, [investSharesQuote, isFetchingInvestQuote, mode, parsedAmount])

  useEffect(() => {
    if (mode !== 'redeem' || parsedAmount === 0n || redeemUsdtQuote === undefined || isFetchingRedeemQuote) return
    setLastRedeemQuotedAmount(parsedAmount)
  }, [redeemUsdtQuote, isFetchingRedeemQuote, mode, parsedAmount])

  const isQuoteLoading = useMemo(() => {
    if (!hasTradeConfig || parsedAmount === 0n) return false
    return mode === 'invest' ? isFetchingInvestQuote : isFetchingRedeemQuote
  }, [hasTradeConfig, isFetchingInvestQuote, isFetchingRedeemQuote, mode, parsedAmount])

  const isQuoteReady = useMemo(() => {
    if (!hasTradeConfig || parsedAmount === 0n) return true
    if (mode === 'invest') {
      return investSharesQuote !== undefined && !isFetchingInvestQuote && lastInvestQuotedAmount === parsedAmount
    }
    return redeemUsdtQuote !== undefined && !isFetchingRedeemQuote && lastRedeemQuotedAmount === parsedAmount
  }, [
    hasTradeConfig,
    investSharesQuote,
    isFetchingInvestQuote,
    isFetchingRedeemQuote,
    lastInvestQuotedAmount,
    lastRedeemQuotedAmount,
    mode,
    parsedAmount,
    redeemUsdtQuote,
  ])

  const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash: pendingHash,
  })

  useEffect(() => {
    if (!isSuccess) return
    setAmount('')
    void Promise.all([queryClient.refetchQueries(), refetchAllowance()])
  }, [isSuccess, queryClient, refetchAllowance])

  async function approve() {
    if (!address || !hasTradeConfig) return
    const hash = await writeContractAsync({
      address: approvalToken,
      abi: erc20ABI,
      functionName: 'approve',
      args: [routerAddress, maxUint256],
    })
    setTransactionKind('approve')
    setPendingHash(hash)
  }

  async function submitTrade() {
    if (!address || !hasTradeConfig || parsedAmount === 0n || !isQuoteReady) return
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 600)
    const investArgs = [targetETF, parsedAmount, minimumShares, deadline] as const
    const redeemArgs = [targetETF, parsedAmount, minimumUsdt, deadline] as const

    console.debug('[BlockETF V2 Trade]', {
      mode,
      targetETF,
      parsedAmount: parsedAmount.toString(),
      minimumShares: minimumShares.toString(),
      minimumUsdt: minimumUsdt.toString(),
      deadline: deadline.toString(),
      quoteReady: isQuoteReady,
    })

    const hash =
      mode === 'invest'
        ? await writeContractAsync({
            address: routerAddress,
            abi: blockETFV2RouterABI,
            functionName: 'mintWithUSDT',
            args: investArgs,
            gas: 5_000_000n,
          })
        : await writeContractAsync({
            address: routerAddress,
            abi: blockETFV2RouterABI,
            functionName: 'burnToUSDT',
            args: redeemArgs,
            gas: 5_000_000n,
          })

    setTransactionKind('trade')
    setPendingHash(hash)
  }

  async function acknowledgeTransaction() {
    setPendingHash(undefined)
    setTransactionKind(null)
  }

  return {
    amount,
    setAmount,
    slippage,
    setSlippage,
    parsedAmount,
    investSharesQuote,
    redeemUsdtQuote,
    minimumShares,
    minimumUsdt,
    usdtBalance,
    shareBalance,
    needsApproval,
    insufficientBalance,
    hasTradeConfig,
    isQuoteLoading,
    isQuoteReady,
    isWriting: isConfirming,
    isSuccess,
    isError,
    error,
    transactionKind,
    pendingHash,
    approve,
    submitTrade,
    acknowledgeTransaction,
  }
}
