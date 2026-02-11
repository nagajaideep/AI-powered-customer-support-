import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { supportAgent } from './support.agent'
import { orderAgent } from './order.agent'
import { billingAgent } from './billing.agent'

const gemini = google('gemini-2.0-flash-exp')

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export const routerAgent = {
  async route(message: string, conversationHistory: ConversationMessage[] = [], userId: string) {
    console.log('🔀 Router Agent: Analyzing query...')

    const agentType = await this.classifyIntent(message, conversationHistory)
    console.log(`✅ Classified as: ${agentType}`)

    let reply: string

    switch (agentType) {
      case 'support':
        reply = await supportAgent.handle(message, conversationHistory, userId)
        break
      case 'order':
        reply = await orderAgent.handle(message, conversationHistory, userId)
        break
      case 'billing':
        reply = await billingAgent.handle(message, conversationHistory, userId)
        break
      default:
        reply = this.handleFallback(message)
    }

    return { agentType, reply }
  },

  async classifyIntent(message: string, conversationHistory: ConversationMessage[] = []): Promise<string> {
    let contextPrompt = ''
    if (conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-4)
      contextPrompt = '\n\nRecent conversation:\n' +
        recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n') +
        '\n\nCurrent message:\n'
    }

    const classificationPrompt = `You are a customer support intent classifier.

${contextPrompt}user: ${message}

Available agents:
- "support": General help, account issues, passwords, features, how-to
- "order": Order tracking, delivery, shipment, modifications, cancellations
- "billing": Payments, invoices, refunds, billing, charges, balance

Respond with ONLY one word: support, order, or billing`

    try {
      const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        prompt: classificationPrompt,
        maxTokens: 10
      })

      const intent = text.trim().toLowerCase()
      if (['support', 'order', 'billing'].includes(intent)) {
        return intent
      }
    } catch (error) {
      console.log('⚠️ OpenAI failed, trying Gemini...')
    }

    try {
      const { text } = await generateText({
        model: gemini,
        prompt: classificationPrompt,
        maxTokens: 10
      })

      const intent = text.trim().toLowerCase()
      if (['support', 'order', 'billing'].includes(intent)) {
        return intent
      }
    } catch (error) {
      console.log('⚠️ Gemini failed, using keyword fallback...')
    }

    const lowerMessage = message.toLowerCase()

    if (lowerMessage.match(/order|track|delivery|ship|package|status|arrive|eta/)) {
      return 'order'
    }
    if (lowerMessage.match(/bill|payment|invoice|refund|charge|balance|subscription|owe|pay/)) {
      return 'billing'
    }
    if (lowerMessage.match(/help|support|account|password|reset|feature|how|question/)) {
      return 'support'
    }

    return 'fallback'
  },

  handleFallback(message: string): string {
    return "I'm here to help! You can ask me about your orders, billing, or general product questions. What would you like to know?"
  }
}