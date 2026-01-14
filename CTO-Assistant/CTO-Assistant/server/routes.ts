import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === Auth Setup ===
  app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) return done(null, false, { message: "Incorrect username." });
      if (user.password !== password) return done(null, false, { message: "Incorrect password." });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // === Routes ===

  // Auth
  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }
      const user = await storage.createUser(input);
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed after register" });
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });

  // Locations
  app.get(api.locations.countries.path, async (req, res) => {
    const countriesList = await storage.getCountries();
    res.json(countriesList);
  });

  app.get(api.locations.cities.path, async (req, res) => {
    const citiesList = await storage.getCities(Number(req.params.countryId));
    res.json(citiesList);
  });

  app.post(api.locations.manageCountries.path, async (req, res) => {
    if (!req.user || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const input = api.locations.manageCountries.input.parse(req.body);
    const country = await storage.createCountry(input);
    res.status(201).json(country);
  });

  app.post(api.locations.manageCities.path, async (req, res) => {
    if (!req.user || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const input = api.locations.manageCities.input.parse(req.body);
    const city = await storage.createCity(input);
    res.status(201).json(city);
  });

  // Services
  app.get(api.services.list.path, async (req, res) => {
    const servicesList = await storage.getServices();
    res.json(servicesList);
  });

  app.post(api.services.manage.path, async (req, res) => {
    if (!req.user || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const input = api.services.manage.input.parse(req.body);
    const service = await storage.createService(input);
    res.status(201).json(service);
  });

  // Providers
  app.get(api.providers.list.path, async (req, res) => {
    const cityId = req.query.cityId ? Number(req.query.cityId) : undefined;
    const serviceId = req.query.serviceId ? Number(req.query.serviceId) : undefined;
    const providers = await storage.getProviders(cityId, serviceId);
    res.json(providers);
  });

  app.get(api.providers.get.path, async (req, res) => {
    const provider = await storage.getProvider(Number(req.params.id));
    if (!provider) return res.status(404).json({ message: "Provider not found" });
    res.json(provider);
  });

  app.post(api.providers.registerService.path, async (req, res) => {
    if (!req.user || (req.user as any).role !== "provider") return res.status(401).json({ message: "Must be a service provider" });
    try {
      const input = api.providers.registerService.input.parse(req.body);
      const service = await storage.addProviderService({ ...input, userId: (req.user as any).id });
      res.status(201).json(service);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.providers.manageServiceApproval.path, async (req, res) => {
    if (!req.user || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const input = api.providers.manageServiceApproval.input.parse(req.body);
    const updated = await storage.updateProviderServiceStatus(Number(req.params.id), input.status);
    if (!updated) return res.status(404).json({ message: "Service not found" });
    res.json(updated);
  });

  app.get(api.providers.listPendingServices.path, async (req, res) => {
    if (!req.user || (req.user as any).role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const pending = await storage.getPendingProviderServices();
    res.json(pending);
  });

  // Bookings
  app.post(api.bookings.create.path, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Must be logged in" });
    try {
      const input = api.bookings.create.input.parse(req.body);
      const booking = await storage.createBooking({ ...input, clientId: (req.user as any).id });
      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.bookings.list.path, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Must be logged in" });
    const user = req.user as any;
    const bookingsList = await storage.getBookings(user.id, user.role);
    res.json(bookingsList);
  });

  // === Seed Data ===
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const hasData = await storage.hasCountries();
  
  // Countries
  const saudi = await storage.createCountry({ name: "Saudi Arabia", code: "SA", currency: "SAR", flag: "🇸🇦" });
  const jordan = await storage.createCountry({ name: "Jordan", code: "JO", currency: "JOD", flag: "🇯🇴" });
  const qatar = await storage.createCountry({ name: "Qatar", code: "QA", currency: "QAR", flag: "🇶🇦" });

  // Cities - Saudi Arabia
  const cities_sa = ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Khobar", "Taif"];
  for (const name of cities_sa) await storage.createCity({ countryId: saudi.id, name });

  // Cities - Jordan
  const cities_jo = ["Amman", "Irbid", "Zarqa", "Aqaba", "Salt", "Mafraq"];
  for (const name of cities_jo) await storage.createCity({ countryId: jordan.id, name });

  // Cities - Qatar
  const cities_qa = ["Doha", "Al Rayyan", "Al Khor", "Al Wakrah", "Umm Salal"];
  for (const name of cities_qa) await storage.createCity({ countryId: qatar.id, name });

  if (hasData) return;

  // Initial Services
  const plumbing = await storage.createService({ nameEn: "Plumbing", nameFr: "Plomberie", nameAr: "سباكة", icon: "Wrench", slug: "plumbing" });
  const cleaning = await storage.createService({ nameEn: "Cleaning", nameFr: "Nettoyage", nameAr: "تنظيف", icon: "Sparkles", slug: "cleaning" });
  const electricity = await storage.createService({ nameEn: "Electricity", nameFr: "Électricité", nameAr: "كهرباء", icon: "Zap", slug: "electricity" });

  // Admin
  await storage.createUser({ username: "admin", password: "password", role: "admin", name: "System Admin", email: "admin@servinear.com", phone: "+123", language: "en" });
  
  console.log("Database updated with new locations!");
}
