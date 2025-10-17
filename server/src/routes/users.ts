import express = require('express');
import { Request, Response } from 'express';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/db';

const usersRouter = express.Router();

// Validation schemas
const createUserSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  account_type: z.enum(['Personal', 'Business']).optional(),
});

// Get all users
usersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
usersRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await db.select().from(users).where(eq(users.id, parseInt(id)));

    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user
usersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validated = createUserSchema.parse(req.body);

    const newUser = await db
      .insert(users)
      .values({
        fullName: validated.full_name,
        email: validated.email,
        accountType: validated.account_type || 'Personal',
      })
      .returning();

    res.status(201).json(newUser[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
usersRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validated = createUserSchema.partial().parse(req.body);

    const updatedUser = await db
      .update(users)
      .set({
        ...validated,
        lastActive: new Date(),
      })
      .where(eq(users.id, parseInt(id)))
      .returning();

    if (!updatedUser.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser[0]);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
usersRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning();

    if (!deletedUser.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default usersRouter;