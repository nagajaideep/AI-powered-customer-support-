import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

const gemini = google('gemini-2.0-flash-exp')

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export const supportAgent = {
  async handle(message: string, conversationHistory: ConversationMessage[] = [], userId: string): Promise<string> {
    console.log('🎯 Support Agent: Processing request...')

    let contextSection = ''
    if (conversationHistory.length > 0) {
      const recentContext = conversationHistory.slice(-6)
      contextSection = '\n\nPrevious conversation:\n' +
        recentContext.map(msg => `${msg.role === 'user' ? 'Customer' : 'Agent'}: ${msg.content}`).join('\n')
    }

    const systemPrompt = `You are a friendly customer support agent.

${contextSection}

Guidelines:
- Reference previous messages if following up
- Provide clear, step-by-step instructions
- Be empathetic and professional
- For password resets: "Visit Account Settings > Security > Reset Password"
- For account issues: "Go to Account Settings"`

    try {
      const { text } = await generateText({
        model: gemini,
        prompt: `${systemPrompt}\n\nCustomer: ${message}\n\nAgent:`,
        maxTokens: 200
      })

      return text
    } catch (error) {
      console.error('Support Agent error:', error)
      return "I'd be happy to help! For account issues, please visit the 'Account Settings' page."
    }
  }
}