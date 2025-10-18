import "dotenv/config";
import { db } from "./db"; // <-- your Drizzle instance
import { users, transactions, assets, portfolioHoldings } from "./schema";

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (optional - comment out to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await db.delete(portfolioHoldings);
    await db.delete(transactions);
    await db.delete(users);
    await db.delete(assets);

    // 1. Create Assets
    console.log('📊 Creating assets...');
const assetsData = await db
      .insert(assets)
      .values([
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          category: 'Technology',
          currentPrice: '150.25',
        },
        {
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          category: 'Technology',
          currentPrice: '140.50',
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          category: 'Technology',
          currentPrice: '380.75',
        },
        {
          symbol: 'TSLA',
          name: 'Tesla Inc.',
          category: 'Automotive',
          currentPrice: '242.35',
        },
        {
          symbol: 'AMZN',
          name: 'Amazon.com Inc.',
          category: 'E-commerce',
          currentPrice: '175.90',
        },
        {
          symbol: 'META',
          name: 'Meta Platforms Inc.',
          category: 'Technology',
          currentPrice: '485.50',
        },
        {
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          category: 'Semiconductors',
          currentPrice: '875.25',
        },
        {
          symbol: 'BRK.B',
          name: 'Berkshire Hathaway Inc.',
          category: 'Finance',
          currentPrice: '385.40',
        },
      ])
      .returning();

    console.log(`✅ Created ${assetsData.length} assets`);

    // 2. Create Users
    console.log('👥 Creating users...');
    const usersData = await db
      .insert(users)
      .values([
        {
          fullName: 'John Doe',
          email: 'john@example.com',
          accountType: 'Personal',
        },
        {
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          accountType: 'Business',
        },
        {
          fullName: 'Robert Johnson',
          email: 'robert@example.com',
          accountType: 'Personal',
        },
        {
          fullName: 'Emily Davis',
          email: 'emily@example.com',
          accountType: 'Personal',
        },
        {
          fullName: 'Michael Wilson',
          email: 'michael@example.com',
          accountType: 'Business',
        },
        {
          fullName: 'Sarah Brown',
          email: 'sarah@example.com',
          accountType: 'Personal',
        },
        {
          fullName: 'David Miller',
          email: 'david@example.com',
          accountType: 'Personal',
        },
        {
          fullName: 'Lisa Anderson',
          email: 'lisa@example.com',
          accountType: 'Business',
        },
        {
          fullName: 'James Taylor',
          email: 'james@example.com',
          accountType: 'Personal',
        },
        {
          fullName: 'Patricia Martinez',
          email: 'patricia@example.com',
          accountType: 'Personal',
        },
      ])
      .returning();

    console.log(`✅ Created ${usersData.length} users`);

    // 3. Create Portfolio Holdings
    console.log('💼 Creating portfolio holdings...');
const holdingsData = await db
      .insert(portfolioHoldings)
      .values([
        // User 1 holdings
        {
          userId: usersData[0].id,
          assetId: assetsData[0].id, // AAPL
          quantity: '50',
          avgPrice: '145.00',
        },
        {
          userId: usersData[0].id,
          assetId: assetsData[1].id, // GOOGL
          quantity: '25',
          avgPrice: '135.00',
        },
        // User 2 holdings
        {
          userId: usersData[1].id,
          assetId: assetsData[2].id, // MSFT
          quantity: '100',
          avgPrice: '370.00',
        },
        {
          userId: usersData[1].id,
          assetId: assetsData[3].id, // TSLA
          quantity: '30',
          avgPrice: '230.00',
        },
        // User 3 holdings
        {
          userId: usersData[2].id,
          assetId: assetsData[4].id, // AMZN
          quantity: '40',
          avgPrice: '170.00',
        },
        // User 4 holdings
        {
          userId: usersData[3].id,
          assetId: assetsData[5].id, // META
          quantity: '15',
          avgPrice: '470.00',
        },
        // User 5 holdings
        {
          userId: usersData[4].id,
          assetId: assetsData[6].id, // NVDA
          quantity: '10',
          avgPrice: '850.00',
        },
      ])
      .returning();

    console.log(`✅ Created ${holdingsData.length} portfolio holdings`);

    // 4. Create Transactions for the last 90 days
    console.log('💳 Creating transactions...');
const transactionsData: typeof transactions.$inferInsert[] = [];

    // Generate transactions for the last 90 days
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // 2-5 transactions per day
      const txCount = Math.floor(Math.random() * 4) + 2;

      for (let j = 0; j < txCount; j++) {
        const userId = usersData[Math.floor(Math.random() * usersData.length)].id;
        const amountNum = Math.floor(Math.random() * 50000) + 1000; // $1k - $50k
        const amountStr = amountNum.toString(); // Convert to string
        const type = Math.random() > 0.7 ? 'withdrawal' : 'deposit'; // 70% deposits, 30% withdrawals

        transactionsData.push({
          userId,
          amount: amountStr,
          currency: 'USD',
          type: type as 'deposit' | 'withdrawal' | 'trade',
          status: 'completed',
          createdAt: date,
        });
      }
    }

    // Insert transactions in batches (50 at a time)
    for (let i = 0; i < transactionsData.length; i += 50) {
      const batch = transactionsData.slice(i, i + 50);
      await db.insert(transactions).values(batch);
    }

    console.log(`✅ Created ${transactionsData.length} transactions`);

    console.log('');
    console.log('✨ Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Assets: ${assetsData.length}`);
    console.log(`   - Users: ${usersData.length}`);
    console.log(`   - Portfolio Holdings: ${holdingsData.length}`);
    console.log(`   - Transactions: ${transactionsData.length}`);
    console.log('');
    console.log('🚀 Your dashboard is ready to display data!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } 
}

seed();