import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  language: varchar("language", { length: 2 }).default('en'),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const memberships = pgTable("memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tier: varchar("tier", { enum: ['silver', 'gold', 'platinum'] }).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default('0'),
  currency: varchar("currency", { length: 3 }).notNull().default('MXN'),
  discountPercentage: integer("discount_percentage").notNull(),
  vipEventsRemaining: integer("vip_events_remaining").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  membershipId: varchar("membership_id").notNull().references(() => memberships.id),
  type: varchar("type", { enum: ['debit', 'credit', 'purchase', 'topup'] }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default('MXN'),
  description: text("description").notNull(),
  discountApplied: decimal("discount_applied", { precision: 10, scale: 2 }).default('0'),
  staffId: varchar("staff_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const welcomeGifts = pgTable("welcome_gifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  membershipId: varchar("membership_id").notNull().references(() => memberships.id),
  giftType: varchar("gift_type").notNull(),
  description: text("description").notNull(),
  isRedeemed: boolean("is_redeemed").default(false),
  redeemedAt: timestamp("redeemed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vipEvents = pgTable("vip_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  eventDate: timestamp("event_date").notNull(),
  imageUrl: varchar("image_url"),
  requiredTier: varchar("required_tier", { enum: ['silver', 'gold', 'platinum'] }).notNull(),
  maxAttendees: integer("max_attendees"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventAttendees = pgTable("event_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => vipEvents.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  membershipId: varchar("membership_id").notNull().references(() => memberships.id),
  rsvpDate: timestamp("rsvp_date").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  membership: one(memberships),
  transactions: many(transactions),
  eventAttendees: many(eventAttendees),
}));

export const membershipsRelations = relations(memberships, ({ one, many }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  welcomeGifts: many(welcomeGifts),
  eventAttendees: many(eventAttendees),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  membership: one(memberships, {
    fields: [transactions.membershipId],
    references: [memberships.id],
  }),
  staff: one(users, {
    fields: [transactions.staffId],
    references: [users.id],
  }),
}));

export const welcomeGiftsRelations = relations(welcomeGifts, ({ one }) => ({
  membership: one(memberships, {
    fields: [welcomeGifts.membershipId],
    references: [memberships.id],
  }),
}));

export const vipEventsRelations = relations(vipEvents, ({ many }) => ({
  attendees: many(eventAttendees),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(vipEvents, {
    fields: [eventAttendees.eventId],
    references: [vipEvents.id],
  }),
  user: one(users, {
    fields: [eventAttendees.userId],
    references: [users.id],
  }),
  membership: one(memberships, {
    fields: [eventAttendees.membershipId],
    references: [memberships.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  language: true,
});

export const insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertWelcomeGiftSchema = createInsertSchema(welcomeGifts).omit({
  id: true,
  createdAt: true,
});

export const insertVipEventSchema = createInsertSchema(vipEvents).omit({
  id: true,
  createdAt: true,
});

export const insertEventAttendeeSchema = createInsertSchema(eventAttendees).omit({
  id: true,
  rsvpDate: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type WelcomeGift = typeof welcomeGifts.$inferSelect;
export type InsertWelcomeGift = z.infer<typeof insertWelcomeGiftSchema>;
export type VipEvent = typeof vipEvents.$inferSelect;
export type InsertVipEvent = z.infer<typeof insertVipEventSchema>;
export type EventAttendee = typeof eventAttendees.$inferSelect;
export type InsertEventAttendee = z.infer<typeof insertEventAttendeeSchema>;
