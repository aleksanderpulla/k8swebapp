import express = require('express');
import { Request, Response } from 'express';
import { db } from '../db/db';
import { transactions, users, portfolioHoldings, assets } from '../db/schema';
import { sql, eq } from 'drizzle-orm';

const documentsRouter = express.Router();

// Generate mock documents based on database data
// In production, you'd have an actual documents table
documentsRouter.get('/', async (req: Request, res: Response) => {
  try {
    // Fetch aggregated data from database to generate documents
    const userCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users);

    const transactionCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(transactions);

    const portfolioCount = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${portfolioHoldings.userId})` })
      .from(portfolioHoldings);

    const assetCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(assets);

    // Generate documents from database statistics
    const documents = [
      {
        id: 1,
        header: 'Portfolio Overview',
        type: 'Report',
        status: 'Done',
        target: '25',
        limit: '30',
        reviewer: 'System',
      },
      {
        id: 2,
        header: `User Management (${userCount[0]?.count || 0} users)`,
        type: 'Documentation',
        status: 'Done',
        target: '20',
        limit: '25',
        reviewer: 'Admin',
      },
      {
        id: 3,
        header: `Transaction Analysis (${transactionCount[0]?.count || 0} transactions)`,
        type: 'Report',
        status: 'In Process',
        target: '15',
        limit: '20',
        reviewer: 'Analyst',
      },
      {
        id: 4,
        header: `Asset Holdings (${assetCount[0]?.count || 0} assets)`,
        type: 'Documentation',
        status: 'Done',
        target: '18',
        limit: '22',
        reviewer: 'Manager',
      },
      {
        id: 5,
        header: `Active Portfolios (${portfolioCount[0]?.count || 0} active)`,
        type: 'Report',
        status: 'Done',
        target: '12',
        limit: '15',
        reviewer: 'Supervisor',
      },
      {
        id: 6,
        header: 'Data Validation Report',
        type: 'Technical',
        status: 'In Process',
        target: '10',
        limit: '12',
        reviewer: 'Assign reviewer',
      },
      {
        id: 7,
        header: 'System Performance Metrics',
        type: 'Technical',
        status: 'Done',
        target: '22',
        limit: '28',
        reviewer: 'DevOps',
      },
      {
        id: 8,
        header: 'Security Audit',
        type: 'Security',
        status: 'In Process',
        target: '30',
        limit: '35',
        reviewer: 'Security Lead',
      },
    ];

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get document by ID
documentsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // In production, fetch from documents table
    // For now, return mock data with real statistics
    const stats = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(eq(transactions.userId, parseInt(id)));

    res.json({
      id,
      header: 'Document Details',
      type: 'Report',
      content: `Details for document ${id}`,
      statistics: {
        totalRecords: stats[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

export default documentsRouter;