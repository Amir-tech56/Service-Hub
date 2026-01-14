import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["client", "provider", "admin"] }).notNull().default("client"),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  bio: text("bio"),
  cityId: integer("city_id"),
  language: text("language").default("en"),
  isVerified: boolean("is_verified").default(false),
  rating: numeric("rating").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // English name or key
  code: text("code").notNull().unique(), // ISO code
  currency: text("currency").notNull(),
  flag: text("flag"), // emoji or url
});

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  countryId: integer("country_id").notNull(),
  name: text("name").notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameFr: text("name_fr").notNull(),
  nameAr: text("name_ar").notNull(),
  icon: text("icon").notNull(), // lucide icon name
  slug: text("slug").notNull().unique(),
  commissionRate: integer("commission_rate").default(10), // Percentage
});

// Link providers to services they offer
export const providerServices = pgTable("provider_services", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  serviceId: integer("service_id").notNull(),
  countryId: integer("country_id"),
  cityId: integer("city_id"),
  priceRange: text("price_range"),
  description: text("description"),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  providerId: integer("provider_id").notNull(),
  serviceId: integer("service_id").notNull(),
  status: text("status", { enum: ["pending", "accepted", "completed", "cancelled"] }).default("pending"),
  scheduledDate: timestamp("scheduled_date"),
  commissionAmount: numeric("commission_amount"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ one, many }) => ({
  city: one(cities, {
    fields: [users.cityId],
    references: [cities.id],
  }),
  providedServices: many(providerServices),
  clientBookings: many(bookings, { relationName: "clientBookings" }),
  providerBookings: many(bookings, { relationName: "providerBookings" }),
}));

export const countriesRelations = relations(countries, ({ many }) => ({
  cities: many(cities),
}));

export const citiesRelations = relations(cities, ({ one, many }) => ({
  country: one(countries, {
    fields: [cities.countryId],
    references: [countries.id],
  }),
  users: many(users),
}));

export const providerServicesRelations = relations(providerServices, ({ one }) => ({
  provider: one(users, {
    fields: [providerServices.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [providerServices.serviceId],
    references: [services.id],
  }),
  country: one(countries, {
    fields: [providerServices.countryId],
    references: [countries.id],
  }),
  city: one(cities, {
    fields: [providerServices.cityId],
    references: [cities.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  client: one(users, {
    fields: [bookings.clientId],
    references: [users.id],
    relationName: "clientBookings",
  }),
  provider: one(users, {
    fields: [bookings.providerId],
    references: [users.id],
    relationName: "providerBookings",
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
}));

// === INSERTS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, isVerified: true, rating: true });
export const insertCountrySchema = createInsertSchema(countries).omit({ id: true });
export const insertCitySchema = createInsertSchema(cities).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertProviderServiceSchema = createInsertSchema(providerServices).omit({ id: true, createdAt: true, status: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, commissionAmount: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

// === EXPLICIT TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Country = typeof countries.$inferSelect;
export type City = typeof cities.$inferSelect;
export type Service = typeof services.$inferSelect;

export type ProviderService = typeof providerServices.$inferSelect;
export type InsertProviderService = z.infer<typeof insertProviderServiceSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
