import { notFound } from 'next/navigation'
import { isAddress } from 'viem'
import { ETFDetailPage } from '@/components/v2/ETFDetailPage'
import { V2Header } from '@/components/v2/V2Header'
import { type Address } from '@/lib/contracts/addresses'

export default async function ETFPage({
  params,
}: {
  params: Promise<{ address: string }>
}) {
  const { address } = await params

  if (!isAddress(address)) {
    notFound()
  }

  return (
    <>
      <V2Header />
      <ETFDetailPage etfAddress={address as Address} />
    </>
  )
}
