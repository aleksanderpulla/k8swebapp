import 'dotenv/config';
import { db } from "../index"; // <-- your Drizzle instance
import { users, transactions, assets, portfolioHoldings } from "./schema";

// ----------------------
// SEED USERS
// ----------------------
const userData = [
  { fullName: "Alice Johnson", email: "alice@fintech.com", accountType: "Personal" },
  { fullName: "Bob Smith", email: "bob@fintech.com", accountType: "Business" },
  { fullName: "Carla Nguyen", email: "carla@fintech.com", accountType: "Personal" },
  { fullName: "David Kim", email: "david@fintech.com", accountType: "Investor" },
  { fullName: "Emma Rossi", email: "emma@fintech.com", accountType: "Personal" },
];

async function seedUsers() {
  await db.insert(users).values(userData);
  console.log("✅ Users seeded");
}

// ----------------------
// SEED ASSETS
// ----------------------
const assetData = [
  { symbol: "AAPL", name: "Apple Inc.", category: "Stock", currentPrice: "183.24" },
  { symbol: "GOOG", name: "Alphabet Inc.", category: "Stock", currentPrice: "132.12" },
  { symbol: "BTC", name: "Bitcoin", category: "Crypto", currentPrice: "67000.50" },
  { symbol: "ETH", name: "Ethereum", category: "Crypto", currentPrice: "2500.80" },
  { symbol: "TSLA", name: "Tesla Inc.", category: "Stock", currentPrice: "255.11" },
];

async function seedAssets() {
  await db.insert(assets).values(assetData);
  console.log("✅ Assets seeded");
}

// ----------------------
// SEED PORTFOLIO HOLDINGS
// ----------------------
async function seedHoldings() {
  const allUsers = await db.select().from(users);
  const allAssets = await db.select().from(assets);

  const holdingsData = [
    {
      userId: allUsers[0].id,
      assetId: allAssets[2].id, // BTC
      quantity: "0.85",
      avgPrice: "48000.00",
    },
    {
      userId: allUsers[0].id,
      assetId: allAssets[0].id, // AAPL
      quantity: "15",
      avgPrice: "172.50",
    },
    {
      userId: allUsers[1].id,
      assetId: allAssets[4].id, // TSLA
      quantity: "10",
      avgPrice: "245.00",
    },
    {
      userId: allUsers[2].id,
      assetId: allAssets[3].id, // ETH
      quantity: "5.2",
      avgPrice: "2200.00",
    },
    {
      userId: allUsers[3].id,
      assetId: allAssets[1].id, // GOOG
      quantity: "8",
      avgPrice: "125.00",
    },
  ];

  await db.insert(portfolioHoldings).values(holdingsData);
  console.log("✅ Portfolio holdings seeded");
}

// ----------------------
// SEED TRANSACTIONS
// ----------------------
async function seedTransactions() {
  const allUsers = await db.select().from(users);

  const txData = [
    {
      userId: allUsers[0].id,
      amount: "500.00",
      currency: "USD",
      type: "Deposit",
      status: "completed",
    },
    {
      userId: allUsers[0].id,
      amount: "-200.00",
      currency: "USD",
      type: "Stock Purchase",
      status: "completed",
    },
    {
      userId: allUsers[1].id,
      amount: "1000.00",
      currency: "USD",
      type: "Deposit",
      status: "completed",
    },
    {
      userId: allUsers[2].id,
      amount: "-500.00",
      currency: "USD",
      type: "Crypto Purchase",
      status: "pending",
    },
    {
      userId: allUsers[4].id,
      amount: "250.00",
      currency: "USD",
      type: "Deposit",
      status: "completed",
    },
  ];

  await db.insert(transactions).values(txData);
  console.log("✅ Transactions seeded");
}

// ----------------------
// RUN SEEDING
// ----------------------
async function runSeed() {
  await seedUsers();
  await seedAssets();
  await seedHoldings();
  await seedTransactions();
  console.log("🌱 All data seeded successfully!");
}

runSeed().catch((err) => {
  console.error("❌ Seeding failed:", err);
});
