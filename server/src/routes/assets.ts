import express = require('express');
import { Request, Response } from 'express';
import { assets } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/db';

const assetsRouter = express.Router();

// Validation schema
const createAssetSchema = z.object({
  symbol: z.string().min(1).max(10),
  name: z.string().min(1).max(50),
  category: z.string().min(1).max(30),
  currentPrice: z.number().positive(),
});

// Get all assets
assetsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const allAssets = await db.select().from(assets);
    res.json(allAssets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Get asset by ID
assetsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const asset = await db.select().from(assets).where(eq(assets.id, parseInt(id)));

    if (!asset.length) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json(asset[0]);
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

// Get asset by symbol
assetsRouter.get('/symbol/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const asset = await db
      .select()
      .from(assets)
      .where(eq(assets.symbol, symbol.toUpperCase()));

    if (!asset.length) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json(asset[0]);
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

// Create new asset
// assetsRouter.post('/', async (req: Request, res: Response) => {
//   try {
//     const validated = createAssetSchema.parse(req.body);

//     const newAsset = await db
//       .insert(assets)
//       .values({
//         symbol: validated.symbol.toUpperCase(),
//         name: validated.name,
//         category: validated.category,
//         currentPrice: validated.currentPrice,
//       })
//       .returning();

//     res.status(201).json(newAsset[0]);
//   } catch (error: any) {
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({ error: error.errors });
//     }
//     if (error.code === '23505') {
//       return res.status(409).json({ error: 'Asset symbol already exists' });
//     }
//     console.error('Error creating asset:', error);
//     res.status(500).json({ error: 'Failed to create asset' });
//   }
// });

// Update asset price
// assetsRouter.put('/:id', async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const validated = createAssetSchema.partial().parse(req.body);

//     const updatedAsset = await db
//       .update(assets)
//       .set(validated)
//       .where(eq(assets.id, parseInt(id)))
//       .returning();

//     if (!updatedAsset.length) {
//       return res.status(404).json({ error: 'Asset not found' });
//     }

//     res.json(updatedAsset[0]);
//   } catch (error: any) {
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({ error: error.errors });
//     }
//     console.error('Error updating asset:', error);
//     res.status(500).json({ error: 'Failed to update asset' });
//   }
// });

// Delete asset
assetsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedAsset = await db
      .delete(assets)
      .where(eq(assets.id, parseInt(id)))
      .returning();

    if (!deletedAsset.length) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

export default assetsRouter;