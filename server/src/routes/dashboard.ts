import * as express from 'express';
import { users, transactions, assets, portfolioHoldings } from '../db/schema';
import { sql } from 'drizzle-orm';
import { eq, gte, lte } from 'drizzle-orm';
import { db } from '../db/db';

const dashboardRouter = express.Router();

// Get dashboard metrics
dashboardRouter.get('/metrics', async (req: express.Request, res: express.Response) => {
  try {
    // Total Revenue (sum of all transactions)
    const revenueResult = await db
      .select({
        total: sql<number>`CAST(COALESCE(SUM(${transactions.amount}), 0) AS NUMERIC(12, 2))`,
      })
      .from(transactions)
      .where(eq(transactions.type, 'Deposit'));

    const totalRevenue = Number(revenueResult[0]?.total || 0);

    // New Customers (count of users)
    const newCustomersResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users);

    const newCustomers = Number(newCustomersResult[0]?.count || 0);

    // Active Accounts (users with portfolio holdings)
    const activeAccountsResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${portfolioHoldings.userId})` })
      .from(portfolioHoldings);

    const activeAccounts = Number(activeAccountsResult[0]?.count || 0);

    // Growth Rate (percentage change - mock calculation)
    const growthRate = 4.5; // Can be calculated based on time period

    res.json({
      totalRevenue: totalRevenue.toFixed(2),
      newCustomers,
      activeAccounts,
      growthRate,
      trendingUp: {
        revenue: '+12.5%',
        customers: '-20%',
        accounts: '+12.5%',
        growth: '+4.5%',
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get total visitors over time (for chart)
dashboardRouter.get('/visitors', async (req: express.Request, res: express.Response) => {
  try {
    const days = 90; // Last 90 days

    // Generate visitor data for the last 90 days
    const visitorData = await db
      .select({
        date: sql<string>`DATE(${transactions.createdAt})`,
        visitors: sql<number>`COUNT(DISTINCT ${transactions.userId})`,
        transactions: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(
        gte(
          transactions.createdAt,
          sql`NOW() - INTERVAL '${days} days'`
        )
      )
      .groupBy(sql`DATE(${transactions.createdAt})`)
      .orderBy(sql`DATE(${transactions.createdAt})`);

    // Transform data for chart
    const chartData = visitorData.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      visitors: parseInt(item.visitors?.toString() || '0'),
      transactions: parseInt(item.transactions?.toString() || '0'),
    }));

    res.json({
      period: 'Last 3 months',
      data: chartData,
    });
  } catch (error) {
    console.error('Error fetching visitor data:', error);
    res.status(500).json({ error: 'Failed to fetch visitor data' });
  }
});

// Get portfolio summary
dashboardRouter.get('/portfolio-summary', async (req: express.Request, res: express.Response) => {
  try {
    const portfolioData = await db
      .select({
        userId: portfolioHoldings.userId,
        assetName: assets.name,
        assetSymbol: assets.symbol,
        quantity: portfolioHoldings.quantity,
        avgPrice: portfolioHoldings.avgPrice,
        currentPrice: assets.currentPrice,
        totalValue: sql<number>`CAST(${portfolioHoldings.quantity} * ${assets.currentPrice} AS NUMERIC(12, 2))`,
        gainLoss: sql<number>`CAST((${assets.currentPrice} - ${portfolioHoldings.avgPrice}) * ${portfolioHoldings.quantity} AS NUMERIC(12, 2))`,
      })
      .from(portfolioHoldings)
      .innerJoin(assets, eq(portfolioHoldings.assetId, assets.id))
      .orderBy(portfolioHoldings.userId);

    res.json(portfolioData);
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio summary' });
  }
});

// Get user activity metrics
dashboardRouter.get('/user-activity', async (req: express.Request, res: express.Response) => {
  try {
    const userMetrics = await db
      .select({
        userId: users.id,
        userName: users.fullName,
        totalTransactions: sql<number>`COUNT(${transactions.id})`,
        totalSpent: sql<number>`CAST(SUM(CASE WHEN ${transactions.type} = 'withdrawal' THEN ${transactions.amount} ELSE 0 END) AS NUMERIC(12, 2))`,
        totalDeposited: sql<number>`CAST(SUM(CASE WHEN ${transactions.type} = 'deposit' THEN ${transactions.amount} ELSE 0 END) AS NUMERIC(12, 2))`,
        lastActive: users.lastActive,
      })
      .from(users)
      .leftJoin(transactions, eq(users.id, transactions.userId))
      .groupBy(users.id, users.fullName, users.lastActive);

    res.json(userMetrics);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

export default dashboardRouter;