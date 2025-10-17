import express = require('express');
import { Request, Response } from 'express';
import { portfolioHoldings, assets, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/db';

const portfolioRouter = express.Router();

// Validation schema
const createHoldingSchema = z.object({
  user_id: z.number().int().positive(),
  asset_id: z.number().int().positive(),
  quantity: z.number().positive(),
  avg_price: z.number().positive(),
});

// Get all portfolio holdings
portfolioRouter.get('/', async (req: Request, res: Response) => {
  try {
    const holdings = await db
      .select({
        id: portfolioHoldings.id,
        user_id: portfolioHoldings.userId,
        asset_id: portfolioHoldings.assetId,
        asset_name: assets.name,
        asset_symbol: assets.symbol,
        quantity: portfolioHoldings.quantity,
        avg_price: portfolioHoldings.avgPrice,
        current_price: assets.currentPrice,
        last_updated: portfolioHoldings.lastUpdated,
      })
      .from(portfolioHoldings)
      .innerJoin(assets, eq(portfolioHoldings.assetId, assets.id));

    res.json(holdings);
  } catch (error) {
    console.error('Error fetching portfolio holdings:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio holdings' });
  }
});

// Get portfolio holdings by user ID
portfolioRouter.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userHoldings = await db
      .select({
        id: portfolioHoldings.id,
        user_id: portfolioHoldings.userId,
        asset_id: portfolioHoldings.assetId,
        asset_name: assets.name,
        asset_symbol: assets.symbol,
        quantity: portfolioHoldings.quantity,
        avg_price: portfolioHoldings.avgPrice,
        current_price: assets.currentPrice,
        last_updated: portfolioHoldings.lastUpdated,
      })
      .from(portfolioHoldings)
      .innerJoin(assets, eq(portfolioHoldings.assetId, assets.id))
      .where(eq(portfolioHoldings.userId, parseInt(userId)));

    res.json(userHoldings);
  } catch (error) {
    console.error('Error fetching user portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch user portfolio' });
  }
});

// Get portfolio holding by ID
portfolioRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const holding = await db
      .select({
        id: portfolioHoldings.id,
        user_id: portfolioHoldings.userId,
        asset_id: portfolioHoldings.assetId,
        asset_name: assets.name,
        asset_symbol: assets.symbol,
        quantity: portfolioHoldings.quantity,
        avg_price: portfolioHoldings.avgPrice,
        current_price: assets.currentPrice,
        last_updated: portfolioHoldings.lastUpdated,
      })
      .from(portfolioHoldings)
      .innerJoin(assets, eq(portfolioHoldings.assetId, assets.id))
      .where(eq(portfolioHoldings.id, id));

    if (!holding.length) {
      return res.status(404).json({ error: 'Portfolio holding not found' });
    }

    res.json(holding[0]);
  } catch (error) {
    console.error('Error fetching portfolio holding:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio holding' });
  }
});

// Create new portfolio holding
// portfolioRouter.post('/', async (req: Request, res: Response) => {
//   try {
//     const validated = createHoldingSchema.parse(req.body);

//     const newHolding = await db
//       .insert(portfolioHoldings)
//       .values({
//         userId: validated.user_id,
//         assetId: validated.asset_id,
//         quantity: validated.quantity,
//         avgPrice: validated.avg_price,
//       })
//       .returning();

//     res.status(201).json(newHolding[0]);
//   } catch (error: any) {
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({ error: error.errors });
//     }
//     console.error('Error creating portfolio holding:', error);
//     res.status(500).json({ error: 'Failed to create portfolio holding' });
//   }
// });

// Update portfolio holding
portfolioRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validated = createHoldingSchema.partial().parse(req.body);

    const updatedHolding = await db
      .update(portfolioHoldings)
      .set({
        ...(validated.quantity !== undefined && { quantity: String(validated.quantity) }),
        ...(validated.avg_price !== undefined && { avgPrice: String(validated.avg_price) }),
        lastUpdated: new Date(),
      })
      .where(eq(portfolioHoldings.id, id))
      .returning();

    if (!updatedHolding.length) {
      return res.status(404).json({ error: 'Portfolio holding not found' });
    }

    res.json(updatedHolding[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating portfolio holding:', error);
    res.status(500).json({ error: 'Failed to update portfolio holding' });
  }
});

// Delete portfolio holding
portfolioRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedHolding = await db
      .delete(portfolioHoldings)
      .where(eq(portfolioHoldings.id, id))
      .returning();

    if (!deletedHolding.length) {
      return res.status(404).json({ error: 'Portfolio holding not found' });
    }

    res.json({ message: 'Portfolio holding deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio holding:', error);
    res.status(500).json({ error: 'Failed to delete portfolio holding' });
  }
});

export default portfolioRouter;