'use client'

import { AgentType } from '@/types/chat'
import { useState, useEffect } from 'react'

export default function TypingIndicator({ agentType }: { agentType: AgentType | null }) {
  const [loadingText, setLoadingText] = useState('')

  const getAgentInfo = () => {
    switch (agentType) {
      case 'order':
        return {
          name: 'Order Specialist',
          messages: [
            'Searching order database...',
            'Checking shipment status...',
            'Verifying tracking information...',
            'Analyzing delivery routes...'
          ]
        }
      case 'billing':
        return {
          name: 'Billing Expert',
          messages: [
            'Reviewing your account...',
            'Checking invoice history...',
            'Calculating balance...',
            'Verifying payment records...'
          ]
        }
      case 'support':
        return {
          name: 'Support Assistant',
          messages: [
            'Analyzing your request...',
            'Searching knowledge base...',
            'Preparing solution...',
            'Reviewing account settings...'
          ]
        }
      default:
        return {
          name: 'AI Agent',
          messages: [
            'Processing your message...',
            'Analyzing intent...',
            'Preparing response...'
          ]
        }
    }
  }

  const { name, messages } = getAgentInfo()

  // Cycle through loading messages
  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      setLoadingText(messages[index])
      index = (index + 1) % messages.length
    }, 1500)

    return () => clearInterval(interval)
  }, [agentType])

  return (
    <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
      <span className="font-medium">{name}</span>
      <span className="text-gray-500">·</span>
      <span className="italic text-gray-500">{loadingText}</span>
    </div>
  )
}