import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { orderTools } from '../tools/order.tools'

const gemini = google('gemini-2.0-flash-exp')

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export const orderAgent = {
  async handle(message: string, conversationHistory: ConversationMessage[] = [], userId: string): Promise<string> {
    console.log('📦 Order Agent: Processing request...')

    const orders = await orderTools.getOrders(userId)

    let contextSection = ''
    if (conversationHistory.length > 0) {
      const recentContext = conversationHistory.slice(-6)
      contextSection = '\n\nPrevious conversation:\n' +
        recentContext.map(msg => `${msg.role === 'user' ? 'Customer' : 'Agent'}: ${msg.content}`).join('\n')
    }

    const systemPrompt = `You are a helpful order tracking specialist.

Available Orders:
${JSON.stringify(orders, null, 2)}

${contextSection}

Guidelines:
- Reference previous conversation if customer is following up
- Provide specific information from order data
- Be friendly and professional`

    try {
      const { text } = await generateText({
        model: gemini,
        prompt: `${systemPrompt}\n\nCustomer: ${message}\n\nAgent:`,
        maxTokens: 200
      })

      return text
    } catch (error) {
      console.error('Order Agent error:', error)

      if (orders.length > 0) {
        const mostRecent = orders[0]
        return `Your most recent order (${mostRecent.trackingNumber}) is currently ${mostRecent.status}.`
      }
      return 'I apologize, but I encountered an error checking your orders. Please try again.'
    }
  }
}