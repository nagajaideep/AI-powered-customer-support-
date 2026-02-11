import { prisma } from '../db/prisma'

/**
 * Get all orders for a user
 * @param userId - User UUID
 * @returns Array of orders
 */
export async function getOrdersByUser(userId: string) {
  // Ensure user exists
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@example.com`
    }
  })

  return await prisma.order.findMany({
    where: { userId },
    orderBy: { id: 'desc' }
  })
}

/**
 * Get specific order by ID
 * @param orderId - Order UUID
 * @returns Order object or null
 */
export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          email: true
        }
      }
    }
  })
}

/**
 * Get order by tracking number
 * @param trackingNumber - Tracking number string
 * @returns Order object or null
 */
export async function getOrderByTrackingNumber(trackingNumber: string) {
  return prisma.order.findFirst({
    where: { trackingNumber },
    include: {
      user: {
        select: {
          email: true
        }
      }
    }
  })
}

/**
 * Get user by email (helper for order queries)
 * @param email - User email
 * @returns User object or null
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  })
}

export const orderTools = {
  async getOrders(userId: string) {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      return orders.map(order => ({
        trackingNumber: order.trackingNumber,
        status: order.status,
        items: order.items,
        total: order.total,
        createdAt: order.createdAt
      }))
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }
}