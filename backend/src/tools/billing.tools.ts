import { prisma } from '../db/prisma'

/**
 * Get all billing records for a user
 * @param userId - User UUID
 * @returns Array of billing records
 */
export async function getBillingRecordsByUser(userId: string) {
  // Ensure user exists
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@example.com`
    }
  })

  return await prisma.billingRecord.findMany({
    where: { userId },
    orderBy: { id: 'desc' }
  })
}

/**
 * Get specific billing record by ID
 * @param billingId - Billing record UUID
 * @returns Billing record or null
 */
export async function getInvoiceById(billingId: string) {
  return prisma.billingRecord.findUnique({
    where: { id: billingId },
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
 * Get user's unpaid invoices
 * @param userId - User UUID
 * @returns Array of unpaid billing records
 */
export async function getUnpaidInvoices(userId: string) {
  return prisma.billingRecord.findMany({
    where: {
      userId,
      status: {
        in: ['UNPAID', 'OVERDUE']
      }
    },
    orderBy: { id: 'desc' }
  })
}

/**
 * Get total amount owed by user
 * @param userId - User UUID
 * @returns Total amount (number)
 */
export async function getTotalAmountOwed(userId: string) {
  const unpaidRecords = await prisma.billingRecord.findMany({
    where: {
      userId,
      status: 'unpaid'
    }
  })

  return unpaidRecords.reduce((sum, record) => sum + record.amount, 0)
}

export const billingTools = {
  async getBillingRecords(userId: string) {
    try {
      const billings = await prisma.billing.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      return billings.map(billing => ({
        invoiceNumber: billing.invoiceNumber,
        amount: billing.amount,
        status: billing.status,
        dueDate: billing.dueDate,
        createdAt: billing.createdAt
      }))
    } catch (error) {
      console.error('Error fetching billing records:', error)
      return []
    }
  }
}