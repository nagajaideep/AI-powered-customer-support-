export type AgentType = 'support' | 'order' | 'billing' | 'router'

export type StreamEventType =
  | 'typing_start'
  | 'typing_end'
  | 'agent_info'
  | 'chunk'
  | 'done'
  | 'error'

export interface StreamEvent {
  type: StreamEventType
  content?: string
  agentType?: AgentType
  timestamp?: string
  message?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  agentType?: AgentType
}

export interface Conversation {
  id: string
  userId: string
  title?: string
  createdAt: string
  updatedAt: string
  messages?: Message[]
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  conversationId?: string
  userId?: string
}