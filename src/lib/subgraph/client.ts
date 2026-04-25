interface GraphQLError {
  message: string
}

interface GraphQLResponse<T> {
  data?: T
  errors?: GraphQLError[]
}

export function getSubgraphUrl() {
  const url = process.env.SUBGRAPH_URL || process.env.NEXT_PUBLIC_SUBGRAPH_URL
  if (!url) {
    throw new Error('SUBGRAPH_URL is not configured')
  }
  return url
}

export function getSubgraphApiKey() {
  return process.env.SUBGRAPH_API_KEY
}

export function normalizeSubgraphId(value?: string | null) {
  return value?.toLowerCase() ?? null
}

export async function subgraphRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch('/api/subgraph', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Subgraph request failed with ${response.status}`)
  }

  const payload = (await response.json()) as GraphQLResponse<T>

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '))
  }

  if (!payload.data) {
    throw new Error('Subgraph returned no data')
  }

  return payload.data
}
