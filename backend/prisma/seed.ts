import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const USERS = [
  { name: 'Sarah Johnson', email: 'sarah.johnson@email.com', avatarColor: '#8b5cf6' },
  { name: 'Michael Chen', email: 'michael.chen@email.com', avatarColor: '#3b82f6' },
  { name: 'Emily Rodriguez', email: 'emily.rodriguez@email.com', avatarColor: '#ec4899' },
  { name: 'James Williams', email: 'james.williams@email.com', avatarColor: '#10b981' },
  { name: 'Lisa Anderson', email: 'lisa.anderson@email.com', avatarColor: '#f59e0b' }
]

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data (in correct order due to foreign keys)
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.billing.deleteMany()
  await prisma.order.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const createdUsers = []
  for (const userData of USERS) {
    const user = await prisma.user.create({
      data: userData
    })
    createdUsers.push(user)
    console.log(`✅ Created user: ${user.name}`)
  }

  // Create orders and billing for each user
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i]

    // Create order
    await prisma.order.create({
      data: {
        userId: user.id,
        trackingNumber: `TRACK${10000 + i}`,
        status: i % 3 === 0 ? 'delivered' : i % 3 === 1 ? 'shipped' : 'pending',
        items: i % 2 === 0 ? 'Laptop, Mouse' : 'Headphones, Keyboard',
        total: 299.99 + (i * 50),
        createdAt: new Date(Date.now() - i * 86400000)
      }
    })
    console.log(`  📦 Created order for ${user.name}`)

    // Create billing record
    await prisma.billing.create({
      data: {
        userId: user.id,
        invoiceNumber: `INV-${2024000 + i}`,
        amount: 150.00 + (i * 25),
        status: i % 2 === 0 ? 'paid' : 'unpaid',
        dueDate: new Date(Date.now() + (i % 2 === 0 ? -5 : 5) * 86400000),
        createdAt: new Date(Date.now() - i * 86400000)
      }
    })
    console.log(`  💳 Created billing for ${user.name}`)
  }

  // Create sample conversation for Sarah Johnson
  const sarah = createdUsers[0]
  const conversation = await prisma.conversation.create({
    data: {
      userId: sarah.id,
      title: 'Order tracking inquiry',
      lastMessageAt: new Date()
    }
  })

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        role: 'user',
        content: 'Where is my order?',
        agentType: null, // ✅ User messages don't have agentType
        timestamp: new Date(Date.now() - 60000)
      },
      {
        conversationId: conversation.id,
        role: 'assistant',
        content: 'Your order TRACK10000 is currently shipped and will arrive in 2-3 business days.',
        agentType: 'order', // ✅ Agent messages have agentType
        timestamp: new Date(Date.now() - 30000)
      }
    ]
  })
  console.log(`  💬 Created sample conversation for ${sarah.name}`)

  console.log('\n✅ Database seeded successfully!')
  console.log(`📊 Created ${createdUsers.length} users with orders and billing records`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })