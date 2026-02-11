const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function sendMessageStream(
  message: string,
  conversationId: string | null,
  onEvent: (event: any) => void
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversationId,
      userId: 'user_1'
    }),
  })

  if (!response.body) {
    throw new Error('No response body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')

      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            onEvent(data)
          } catch (e) {
            console.error('Failed to parse SSE data:', e)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export async function sendMessageSync(message: string, conversationId: string | null = null): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/messages/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversationId,
      userId: 'user_1'
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to send message')
  }

  return response.json()
}