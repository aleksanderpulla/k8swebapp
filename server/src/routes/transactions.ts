import express = require('express');
import { Request, Response } from 'express';
import { transactions } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/db';

const transactionsRouter = express.Router();

// Validation schema
const createTransactionSchema = z.object({
  user_id: z.number().int().positive(),
  amount: z.number().positive(),
  currency: z.string().max(10).optional(),
  type: z.enum(['deposit', 'withdrawal', 'trade']),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
});

// Get all transactions
transactionsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const allTransactions = await db.select().from(transactions);
    res.json(allTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction by ID
transactionsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));

    if (!transaction.length) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction[0]);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Get transactions by user ID
transactionsRouter.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, parseInt(userId)));

    res.json(userTransactions);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ error: 'Failed to fetch user transactions' });
  }
});

// Create new transaction
// router.post('/', async (req: Request, res: Response) => {
//   try {
//     const validated = createTransactionSchema.parse(req.body);

//     const newTransaction = await db
//       .insert(transactions)
//       .values({
//         userId: validated.user_id,
//         amount: validated.amount,
//         currency: validated.currency || 'USD',
//         type: validated.type,
//         status: validated.status || 'completed',
//         createdAt: new Date(),
//       })
//       .returning();

//     res.status(201).json(newTransaction[0]);
//   } catch (error: any) {
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({ error: error.errors });
//     }
//     console.error('Error creating transaction:', error);
//     res.status(500).json({ error: 'Failed to create transaction' });
//   }
// });

// Update transaction
transactionsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validated = createTransactionSchema.partial().parse(req.body);

    const updateData: any = {};
    if (validated.amount) updateData.amount = validated.amount;
    if (validated.currency) updateData.currency = validated.currency;
    if (validated.type) updateData.type = validated.type;
    if (validated.status) updateData.status = validated.status;

    const updatedTransaction = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();

    if (!updatedTransaction.length) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(updatedTransaction[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction
transactionsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedTransaction = await db
      .delete(transactions)
      .where(eq(transactions.id, id))
      .returning();

    if (!deletedTransaction.length) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default transactionsRouter;