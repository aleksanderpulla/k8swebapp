import 'dotenv/config';
import { db } from "./db"; // <-- your Drizzle instance
import { users, transactions, assets, portfolioHoldings } from "./schema";

// ...existing code...

const TOTAL = 1000;
const CHUNK_SIZE = 200;

function chunkArray<T>(arr: T[], size = CHUNK_SIZE) {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 2) {
  return (Math.random() * (max - min) + min).toFixed(decimals);
}

function generateUsers(n = TOTAL) {
  const accountTypes = ["Personal", "Business", "Investor", "Institutional"];
  const arr = [];
  for (let i = 1; i <= n; i++) {
    arr.push({
      fullName: `User ${i}`,
      email: `user${i}@example.com`,
      accountType: accountTypes[i % accountTypes.length],
    });
  }
  return arr;
}

function generateAssets(n = TOTAL) {
  const categories = ["Stock", "Crypto", "ETF", "Bond"];
  const arr = [];
  for (let i = 1; i <= n; i++) {
    const category = categories[i % categories.length];
    // Give cryptos higher typical prices sometimes
    const price =
      category === "Crypto"
        ? randFloat(100, 70000, 2)
        : randFloat(1, 2000, 2);
    arr.push({
      symbol: `ASSET${String(i).padStart(4, "0")}`,
      name: `Asset ${i}`,
      category,
      currentPrice: String(price),
    });
  }
  return arr;
}

async function seedUsers() {
  const data = generateUsers();
  const chunks = chunkArray(data);
  for (const chunk of chunks) {
    await db.insert(users).values(chunk);
  }
  console.log(`✅ ${data.length} Users seeded`);
}

async function seedAssets() {
  const data = generateAssets();
  const chunks = chunkArray(data);
  for (const chunk of chunks) {
    await db.insert(assets).values(chunk);
  }
  console.log(`✅ ${data.length} Assets seeded`);
}

async function seedHoldings() {
  const allUsers = await db.select().from(users);
  const allAssets = await db.select().from(assets);

  if (allUsers.length === 0 || allAssets.length === 0) {
    throw new Error("Users or assets missing for holdings seeding");
  }

  const holdingsData = [];
  for (let i = 0; i < TOTAL; i++) {
    const user = allUsers[randInt(0, allUsers.length - 1)];
    const asset = allAssets[randInt(0, allAssets.length - 1)];
    const qty = randFloat(0.01, 200, 6); // smaller precision for quantity
    const avgPrice = randFloat(
      Math.max(0.01, parseFloat(asset.currentPrice) * 0.5),
      parseFloat(asset.currentPrice) * 1.5,
      2
    );
    holdingsData.push({
      userId: user.id,
      assetId: asset.id,
      quantity: String(qty),
      avgPrice: String(avgPrice),
    });
  }

  const chunks = chunkArray(holdingsData);
  for (const chunk of chunks) {
    await db.insert(portfolioHoldings).values(chunk);
  }
  console.log(`✅ ${holdingsData.length} Portfolio holdings seeded`);
}

async function seedTransactions() {
  const allUsers = await db.select().from(users);
  if (allUsers.length === 0) {
    throw new Error("Users missing for transactions seeding");
  }

  const types = [
    "Deposit",
    "Withdrawal",
    "Stock Purchase",
    "Crypto Purchase",
    "Fee",
    "Dividend",
  ];
  const statusOptions = ["completed", "pending", "failed"];

  const txData = [];
  for (let i = 0; i < TOTAL; i++) {
    const user = allUsers[randInt(0, allUsers.length - 1)];
    const type = types[randInt(0, types.length - 1)];
    // Deposits and dividends positive, purchases/withdrawals/fees negative
    let amount = parseFloat(randFloat(1, 10000, 2));
    if (["Withdrawal", "Stock Purchase", "Crypto Purchase", "Fee"].includes(type)) {
      amount = -amount;
    }
    txData.push({
      userId: user.id,
      amount: String(amount.toFixed(2)),
      currency: "USD",
      type,
      status: statusOptions[randInt(0, statusOptions.length - 1)],
    });
  }

  const chunks = chunkArray(txData);
  for (const chunk of chunks) {
    await db.insert(transactions).values(chunk);
  }
  console.log(`✅ ${txData.length} Transactions seeded`);
}

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