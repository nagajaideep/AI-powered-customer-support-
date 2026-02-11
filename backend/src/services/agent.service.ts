import { prisma } from '../db/prisma'

export const agentService = {
  async listAgents() {
    return [
      {
        type: 'support',
        name: 'Support Agent',
        icon: '💡',
        description: 'General inquiries & troubleshooting',
        capabilities: ['FAQs', 'Account Help', 'Technical Support']
      },
      {
        type: 'order',
        name: 'Order Agent',
        icon: '📦',
        description: 'Order status & tracking',
        capabilities: ['Track Orders', 'Delivery Status', 'Order Modifications']
      },
      {
        type: 'billing',
        name: 'Billing Agent',
        icon: '💳',
        description: 'Payments & refunds',
        capabilities: ['Invoices', 'Refunds', 'Payment Issues']
      }
    ]
  },

  async getAgentCapabilities(agentType: string) {
    const agents: any = {
      support: {
        type: 'support',
        capabilities: ['Query conversation history', 'Provide help articles', 'Troubleshooting guides'],
        tools: ['getConversationHistory']
      },
      order: {
        type: 'order',
        capabilities: ['Fetch order details', 'Check delivery status', 'Track shipments'],
        tools: ['getOrders', 'trackOrder']
      },
      billing: {
        type: 'billing',
        capabilities: ['Get invoice details', 'Check refund status', 'View payment history'],
        tools: ['getBillingRecords', 'getInvoices']
      }
    }

    return agents[agentType] || null
  },

  async getUser(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarColor: true
      }
    })
  },

  async getUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarColor: true
      },
      orderBy: { name: 'asc' }
    })
  }
}