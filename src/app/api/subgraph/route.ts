import { NextRequest, NextResponse } from 'next/server'
import { getSubgraphUrl } from '@/lib/subgraph/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(getSubgraphUrl(), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const text = await response.text()

    return new NextResponse(text, {
      status: response.status,
      headers: {
        'content-type': 'application/json',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        errors: [
          {
            message: error instanceof Error ? error.message : 'Subgraph proxy request failed',
          },
        ],
      },
      { status: 500 }
    )
  }
}
