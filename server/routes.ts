import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertMembershipSchema, insertTransactionSchema, insertVipEventSchema, insertEventAttendeeSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Membership routes
  app.get('/api/membership', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const membership = await storage.getMembershipByUserId(userId);
      if (!membership) {
        return res.status(404).json({ message: "No active membership found" });
      }
      res.json(membership);
    } catch (error) {
      console.error("Error fetching membership:", error);
      res.status(500).json({ message: "Failed to fetch membership" });
    }
  });

  app.post('/api/membership', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertMembershipSchema.parse({
        ...req.body,
        userId,
      });

      // Set tier-specific defaults
      const tierDefaults = {
        silver: { discountPercentage: 5, vipEventsRemaining: 1, balance: '12000.00' },
        gold: { discountPercentage: 10, vipEventsRemaining: 2, balance: '20000.00' },
        platinum: { discountPercentage: 15, vipEventsRemaining: 999, balance: '30000.00' }
      };

      const defaults = tierDefaults[validatedData.tier as keyof typeof tierDefaults];
      const membershipData = {
        ...validatedData,
        ...defaults,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      };

      const membership = await storage.createMembership(membershipData);

      // Create welcome gifts based on tier
      const welcomeGifts = {
        silver: [{ giftType: 'skincare_product', description: 'Complimentary skincare product based on skin type' }],
        gold: [
          { giftType: 'skincare_product', description: 'Premium skincare product' },
          { giftType: 'facial_treatment', description: 'Personalized facial treatment' }
        ],
        platinum: [
          { giftType: 'skincare_product', description: 'Premium skincare product' },
          { giftType: 'premium_facial', description: 'Premium personalized facial' },
          { giftType: 'laser_facial', description: 'Laser facial from selected options' }
        ]
      };

      const gifts = welcomeGifts[validatedData.tier as keyof typeof welcomeGifts];
      for (const gift of gifts) {
        await storage.createWelcomeGift({
          membershipId: membership.id,
          ...gift,
        });
      }

      res.json(membership);
    } catch (error) {
      console.error("Error creating membership:", error);
      res.status(500).json({ message: "Failed to create membership" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await storage.getTransactionsByUserId(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        userId,
      });

      // Get membership to validate and update balance
      const membership = await storage.getMembershipByUserId(userId);
      if (!membership) {
        return res.status(404).json({ message: "No active membership found" });
      }

      // For debit transactions, check sufficient balance
      if (validatedData.type === 'debit' || validatedData.type === 'purchase') {
        const currentBalance = parseFloat(membership.balance);
        const transactionAmount = parseFloat(validatedData.amount);
        
        if (currentBalance < transactionAmount) {
          return res.status(400).json({ message: "Insufficient balance" });
        }

        // Update balance
        const newBalance = (currentBalance - transactionAmount).toString();
        await storage.updateMembershipBalance(membership.id, newBalance);
      } else if (validatedData.type === 'credit' || validatedData.type === 'topup') {
        // For credit transactions, add to balance
        const currentBalance = parseFloat(membership.balance);
        const transactionAmount = parseFloat(validatedData.amount);
        const newBalance = (currentBalance + transactionAmount).toString();
        await storage.updateMembershipBalance(membership.id, newBalance);
      }

      const transaction = await storage.createTransaction({
        ...validatedData,
        membershipId: membership.id,
      });

      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Admin routes for staff
  app.post('/api/admin/balance', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { membershipId, amount, type, description } = req.body;
      
      if (!membershipId || !amount || !type || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const membership = await storage.getMembershipByUserId(membershipId);
      if (!membership) {
        return res.status(404).json({ message: "Membership not found" });
      }

      const currentBalance = parseFloat(membership.balance);
      const transactionAmount = parseFloat(amount);
      
      let newBalance: number;
      if (type === 'add') {
        newBalance = currentBalance + transactionAmount;
      } else if (type === 'deduct') {
        newBalance = Math.max(0, currentBalance - transactionAmount);
      } else {
        return res.status(400).json({ message: "Invalid transaction type" });
      }

      await storage.updateMembershipBalance(membership.id, newBalance.toString());

      const transaction = await storage.createTransaction({
        userId: membership.userId,
        membershipId: membership.id,
        type: type === 'add' ? 'credit' : 'debit',
        amount: transactionAmount.toString(),
        currency: membership.currency,
        description,
        staffId: req.user.claims.sub,
      });

      res.json({ transaction, newBalance: newBalance.toString() });
    } catch (error) {
      console.error("Error updating balance:", error);
      res.status(500).json({ message: "Failed to update balance" });
    }
  });

  // VIP Events routes
  app.get('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const events = await storage.getActiveVipEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/events/rsvp', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.body;

      const membership = await storage.getMembershipByUserId(userId);
      if (!membership) {
        return res.status(404).json({ message: "No active membership found" });
      }

      const attendee = await storage.rsvpToEvent({
        eventId,
        userId,
        membershipId: membership.id,
      });

      res.json(attendee);
    } catch (error) {
      console.error("Error RSVPing to event:", error);
      res.status(500).json({ message: "Failed to RSVP to event" });
    }
  });

  // Welcome gifts routes
  app.get('/api/welcome-gifts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const membership = await storage.getMembershipByUserId(userId);
      
      if (!membership) {
        return res.status(404).json({ message: "No active membership found" });
      }

      const gifts = await storage.getWelcomeGiftsByMembershipId(membership.id);
      res.json(gifts);
    } catch (error) {
      console.error("Error fetching welcome gifts:", error);
      res.status(500).json({ message: "Failed to fetch welcome gifts" });
    }
  });

  app.post('/api/welcome-gifts/:giftId/redeem', isAuthenticated, async (req: any, res) => {
    try {
      const { giftId } = req.params;
      const gift = await storage.redeemWelcomeGift(giftId);
      res.json(gift);
    } catch (error) {
      console.error("Error redeeming gift:", error);
      res.status(500).json({ message: "Failed to redeem gift" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
