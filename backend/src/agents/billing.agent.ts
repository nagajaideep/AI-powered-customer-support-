import OpenAI from 'openai'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getBillingRecordsByUser, getTotalAmountOwed } from "../tools/billing.tools"
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { billingTools } from '../tools/billing.tools'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const gemini = google('gemini-2.0-flash-exp')

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

// Try OpenAI for billing response
async function tryOpenAIBilling(userMessage: string, userId: string): Promise<string | null> {
  try {
    if (!process.env.OPENAI_API_KEY) return null

    console.log('🤖 Billing Agent using OpenAI')

    const billingRecords = await getBillingRecordsByUser(userId)
    const totalOwed = await getTotalAmountOwed(userId)

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a billing support assistant.
- Answer ONLY based on billing data provided
- Be clear about amounts and dates
- Explain payment status professionally
- Do not make assumptions about data not present
- Keep responses concise and accurate`
        },
        {
          role: "user",
          content: `Billing records:
${JSON.stringify(billingRecords, null, 2)}

Total amount owed: $${totalOwed}

User question: "${userMessage}"

Answer based ONLY on this billing data.`
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    })

    return completion.choices[0]?.message?.content || null

  } catch (error) {
    console.error('❌ OpenAI Billing failed:', error)
    return null
  }
}

// Try Gemini for billing response
async function tryGeminiBilling(userMessage: string, userId: string): Promise<string | null> {
  try {
    if (!process.env.GEMINI_API_KEY) return null

    console.log('🤖 Billing Agent using Gemini')

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    })

    const billingRecords = await getBillingRecordsByUser(userId)
    const totalOwed = await getTotalAmountOwed(userId)

    const prompt = `You are a billing support assistant.

Billing records:
${JSON.stringify(billingRecords, null, 2)}

Total amount owed: $${totalOwed}

User question: "${userMessage}"

Answer clearly and professionally based ONLY on this data. Do not assume information not present.`

    const result = await model.generateContent(prompt)
    return result.response.text()

  } catch (error) {
    console.error('❌ Gemini Billing failed:', error)
    return null
  }
}

// Fallback response generator
async function generateFallbackBilling(userMessage: string, userId: string): Promise<string> {
  try {
    const billingRecords = await getBillingRecordsByUser(userId)
    const totalOwed = await getTotalAmountOwed(userId)

    if (billingRecords.length === 0) {
      return "I couldn't find any billing records for your account. If you believe this is an error, please contact our billing department."
    }

    if (totalOwed > 0) {
      return `You currently have an outstanding balance of $${totalOwed.toFixed(2)}. Your most recent invoice is ${billingRecords[0].status.toLowerCase()}.`
    }

    return "Your account is in good standing with no outstanding balance. All invoices are paid."

  } catch (error) {
    return "I'm having trouble accessing your billing information right now. Please try again in a moment or contact our billing department."
  }
}

export const billingAgent = {
  async handle(message: string, conversationHistory: ConversationMessage[] = [], userId: string): Promise<string> {
    console.log('💳 Billing Agent: Processing request...')

    const billingRecords = await billingTools.getBillingRecords(userId)

    let contextSection = ''
    if (conversationHistory.length > 0) {
      const recentContext = conversationHistory.slice(-6)
      contextSection = '\n\nPrevious conversation:\n' +
        recentContext.map(msg => `${msg.role === 'user' ? 'Customer' : 'Agent'}: ${msg.content}`).join('\n')
    }

    const systemPrompt = `You are a professional billing specialist.

Account Billing Information:
${JSON.stringify(billingRecords, null, 2)}

${contextSection}

Guidelines:
- Reference previous conversation if following up
- Calculate totals accurately
- Mention invoice numbers
- Be empathetic about billing concerns`

    try {
      const { text } = await generateText({
        model: gemini,
        prompt: `${systemPrompt}\n\nCustomer: ${message}\n\nAgent:`,
        maxTokens: 200
      })

      return text
    } catch (error) {
      console.error('Billing Agent error:', error)

      const unpaid = billingRecords.filter((r: any) => r.status === 'unpaid')
      if (unpaid.length > 0) {
        const total = unpaid.reduce((sum: number, r: any) => sum + r.amount, 0)
        return `You currently have an outstanding balance of $${total.toFixed(2)} across ${unpaid.length} invoice(s).`
      }
      return 'Your account is in good standing with no outstanding balance.'
    }
  }
}