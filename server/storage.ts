import {
  users,
  memberships,
  transactions,
  welcomeGifts,
  vipEvents,
  eventAttendees,
  type User,
  type UpsertUser,
  type Membership,
  type InsertMembership,
  type Transaction,
  type InsertTransaction,
  type WelcomeGift,
  type InsertWelcomeGift,
  type VipEvent,
  type InsertVipEvent,
  type EventAttendee,
  type InsertEventAttendee,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Membership operations
  getMembershipByUserId(userId: string): Promise<Membership | undefined>;
  createMembership(membership: InsertMembership): Promise<Membership>;
  updateMembershipBalance(membershipId: string, newBalance: string): Promise<Membership>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: string, limit?: number): Promise<Transaction[]>;
  getTransactionsByMembershipId(membershipId: string, limit?: number): Promise<Transaction[]>;
  
  // Welcome gift operations
  getWelcomeGiftsByMembershipId(membershipId: string): Promise<WelcomeGift[]>;
  createWelcomeGift(gift: InsertWelcomeGift): Promise<WelcomeGift>;
  redeemWelcomeGift(giftId: string): Promise<WelcomeGift>;
  
  // VIP event operations
  getActiveVipEvents(): Promise<VipEvent[]>;
  getVipEventsByTier(tier: string): Promise<VipEvent[]>;
  rsvpToEvent(attendee: InsertEventAttendee): Promise<EventAttendee>;
  getUserEventAttendance(userId: string): Promise<EventAttendee[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Membership operations
  async getMembershipByUserId(userId: string): Promise<Membership | undefined> {
    const [membership] = await db
      .select()
      .from(memberships)
      .where(and(eq(memberships.userId, userId), eq(memberships.isActive, true)));
    return membership;
  }

  async createMembership(membershipData: InsertMembership): Promise<Membership> {
    const [membership] = await db
      .insert(memberships)
      .values(membershipData)
      .returning();
    return membership;
  }

  async updateMembershipBalance(membershipId: string, newBalance: string): Promise<Membership> {
    const [membership] = await db
      .update(memberships)
      .set({ 
        balance: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(memberships.id, membershipId))
      .returning();
    return membership;
  }

  // Transaction operations
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  async getTransactionsByUserId(userId: string, limit: number = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getTransactionsByMembershipId(membershipId: string, limit: number = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.membershipId, membershipId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  // Welcome gift operations
  async getWelcomeGiftsByMembershipId(membershipId: string): Promise<WelcomeGift[]> {
    return await db
      .select()
      .from(welcomeGifts)
      .where(eq(welcomeGifts.membershipId, membershipId))
      .orderBy(desc(welcomeGifts.createdAt));
  }

  async createWelcomeGift(giftData: InsertWelcomeGift): Promise<WelcomeGift> {
    const [gift] = await db
      .insert(welcomeGifts)
      .values(giftData)
      .returning();
    return gift;
  }

  async redeemWelcomeGift(giftId: string): Promise<WelcomeGift> {
    const [gift] = await db
      .update(welcomeGifts)
      .set({ 
        isRedeemed: true,
        redeemedAt: new Date(),
      })
      .where(eq(welcomeGifts.id, giftId))
      .returning();
    return gift;
  }

  // VIP event operations
  async getActiveVipEvents(): Promise<VipEvent[]> {
    return await db
      .select()
      .from(vipEvents)
      .where(and(
        eq(vipEvents.isActive, true),
        gte(vipEvents.eventDate, new Date())
      ))
      .orderBy(vipEvents.eventDate);
  }

  async getVipEventsByTier(tier: string): Promise<VipEvent[]> {
    return await db
      .select()
      .from(vipEvents)
      .where(and(
        eq(vipEvents.isActive, true),
        eq(vipEvents.requiredTier, tier),
        gte(vipEvents.eventDate, new Date())
      ))
      .orderBy(vipEvents.eventDate);
  }

  async rsvpToEvent(attendeeData: InsertEventAttendee): Promise<EventAttendee> {
    const [attendee] = await db
      .insert(eventAttendees)
      .values(attendeeData)
      .returning();
    return attendee;
  }

  async getUserEventAttendance(userId: string): Promise<EventAttendee[]> {
    return await db
      .select()
      .from(eventAttendees)
      .where(eq(eventAttendees.userId, userId))
      .orderBy(desc(eventAttendees.rsvpDate));
  }
}

export const storage = new DatabaseStorage();
