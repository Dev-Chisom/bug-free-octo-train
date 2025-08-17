const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface ProxyRequestOptions {
  method: string
  headers?: Record<string, string>
  body?: any
}

interface ProxyResponse {
  data: any
  status: number
}

export async function proxyRequest(endpoint: string, options: ProxyRequestOptions): Promise<ProxyResponse> {
  try {
    const url = `${EXTERNAL_API_URL}${endpoint}`

    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    throw new Error(`Proxy request failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
