import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, UserRole, OrderStatus } from '../src/generated/prisma/index.js'
import * as bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export async function main() {
  console.log('🌱 Seeding database...')

  // ── Users ────────────────────────────────────────────────────────────────

  const passwordHash = await bcrypt.hash('password123', 10)

  const customer = await prisma.user.upsert({
    where: { email: 'amina@example.com' },
    update: {},
    create: { email: 'amina@example.com', name: 'Amina Yusuf', passwordHash, role: UserRole.CUSTOMER },
  })

  const restaurant = await prisma.user.upsert({
    where: { email: 'karim@basilkitchen.com' },
    update: {},
    create: { email: 'karim@basilkitchen.com', name: 'Karim Haddad', passwordHash, role: UserRole.RESTAURANT },
  })

  await prisma.user.upsert({
    where: { email: 'admin@omnibite.com' },
    update: {},
    create: { email: 'admin@omnibite.com', name: 'Sarah Admin', passwordHash, role: UserRole.ADMIN },
  })

  console.log('✅ Users seeded')

  // ── Restaurants ──────────────────────────────────────────────────────────

  const basilEmber = await prisma.restaurant.upsert({
    where: { slug: 'basil-ember-kitchen' },
    update: { ownerId: restaurant.id },
    create: {
      slug: 'basil-ember-kitchen',
      name: 'Basil & Ember Kitchen',
      cuisine: 'Levantine',
      rating: 4.8,
      deliveryMin: 25,
      deliveryMax: 35,
      ownerId: restaurant.id
    },
  });

  const nonnasTable = await prisma.restaurant.upsert({
    where: { slug: 'nonnas-table' },
    update: {},
    create: { name: "Nonna's Table", slug: 'nonnas-table', cuisine: 'Italian', rating: 4.6, deliveryMin: 30, deliveryMax: 40 },
  })

  const sakuraBowl = await prisma.restaurant.upsert({
    where: { slug: 'sakura-bowl' },
    update: {},
    create: { name: 'Sakura Bowl', slug: 'sakura-bowl', cuisine: 'Japanese', rating: 4.9, deliveryMin: 20, deliveryMax: 30 },
  })

  // Update users to have restaurantId
  await prisma.user.update({
    where: { id: restaurant.id },
    data: { restaurantId: basilEmber.id }
  })

  console.log('✅ Restaurants seeded')

  // ── Menu Items ───────────────────────────────────────────────────────────

  const chicken = await prisma.menuItem.upsert({
    where: { id: 'menu-be-001' },
    update: {},
    create: { id: 'menu-be-001', restaurantId: basilEmber.id, name: 'Basil Grilled Chicken', description: 'Charcoal chicken, garlic toum, saffron rice, grilled vegetables.', price: 32, category: 'Mains', isAvailable: true },
  })

  const hummus = await prisma.menuItem.upsert({
    where: { id: 'menu-be-002' },
    update: {},
    create: { id: 'menu-be-002', restaurantId: basilEmber.id, name: 'Hummus & Warm Bread', description: 'Silky chickpea hummus, olive oil, sumac, toasted flatbread.', price: 14, category: 'Starters', isAvailable: true },
  })

  await prisma.menuItem.upsert({
    where: { id: 'menu-be-003' },
    update: {},
    create: { id: 'menu-be-003', restaurantId: basilEmber.id, name: 'Fattoush Salad', description: 'Crisp romaine, radish, pomegranate, sumac vinaigrette.', price: 16, category: 'Starters', isAvailable: true },
  })

  await prisma.menuItem.upsert({
    where: { id: 'menu-be-004' },
    update: {},
    create: { id: 'menu-be-004', restaurantId: basilEmber.id, name: 'Lamb Kofta Platter', description: 'Char-grilled lamb kofta, tahini, pickled turnip.', price: 36, category: 'Mains', isAvailable: false },
  })

  await prisma.menuItem.upsert({
    where: { id: 'menu-be-005' },
    update: {},
    create: { id: 'menu-be-005', restaurantId: basilEmber.id, name: 'Knafeh', description: 'Sweet cheese pastry, orange blossom syrup, pistachio.', price: 18, category: 'Desserts', isAvailable: true },
  })

  console.log('✅ Menu items seeded')

  // ── Sample Orders ────────────────────────────────────────────────────────

  await prisma.order.upsert({
    where: { id: 'order-seed-001' },
    update: {},
    create: {
      id: 'order-seed-001',
      customerId: customer.id,
      restaurantId: basilEmber.id,
      status: OrderStatus.PENDING,
      deliveryAddress: { street: '12 Jalan Kemboja', city: 'Kuala Terengganu', postcode: '20050', notes: 'Ring the doorbell twice.', phone: '+60 12-345 6789' },
      items: {
        create: [
          { menuItemId: chicken.id, name: chicken.name, price: chicken.price, quantity: 2 },
          { menuItemId: hummus.id, name: hummus.name, price: hummus.price, quantity: 1 },
        ],
      },
    },
  })

  console.log('✅ Sample orders seeded')
  console.log('')
  console.log('🎉 Done. Test credentials (password: password123):')
  console.log(`   Customer → amina@example.com`)
  console.log(`   Restaurant → karim@basilkitchen.com`)
  console.log(`   Admin    → admin@omnibite.com`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await pool.end() })