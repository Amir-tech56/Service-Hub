import { db } from "./db";
import { 
  users, countries, cities, services, providerServices, bookings, reviews,
  type User, type InsertUser, 
  type Country, type City, type Service,
  type Booking, type InsertBooking,
  type ProviderService, type InsertProviderService
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Locations
  getCountries(): Promise<Country[]>;
  getCities(countryId: number): Promise<City[]>;
  createCountry(country: any): Promise<Country>;
  createCity(city: any): Promise<City>;
  
  // Services
  getServices(): Promise<Service[]>;
  createService(service: any): Promise<Service>;
  
  // Providers
  getProviders(cityId?: number, serviceId?: number): Promise<(User & { providedServices: ProviderService[] })[]>;
  getProvider(id: number): Promise<(User & { providedServices: ProviderService[] }) | undefined>;
  addProviderService(service: InsertProviderService): Promise<ProviderService>;
  updateProviderServiceStatus(id: number, status: "approved" | "rejected"): Promise<ProviderService | undefined>;
  getPendingProviderServices(): Promise<(ProviderService & { service: Service, provider: User })[]>;
  
  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(userId: number, role: "client" | "provider" | "admin"): Promise<(Booking & { service: Service, provider: User, client: User })[]>;
  
  // Seed checks
  hasCountries(): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCountries(): Promise<Country[]> {
    return await db.select().from(countries);
  }

  async getCities(countryId: number): Promise<City[]> {
    return await db.select().from(cities).where(eq(cities.countryId, countryId));
  }

  async createCountry(country: any): Promise<Country> {
    const [c] = await db.insert(countries).values(country).returning();
    return c;
  }
  
  async createCity(city: any): Promise<City> {
    const [c] = await db.insert(cities).values(city).returning();
    return c;
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async createService(service: any): Promise<Service> {
    const [s] = await db.insert(services).values(service).returning();
    return s;
  }

  async getProviders(cityId?: number, serviceId?: number): Promise<(User & { providedServices: ProviderService[] })[]> {
    let query = db.select().from(users).where(eq(users.role, "provider"));
    
    if (cityId) {
      query = db.select().from(users).where(and(eq(users.role, "provider"), eq(users.cityId, cityId)));
    }

    const providers = await query;
    
    const result = [];
    for (const p of providers) {
      const pServices = await db.select().from(providerServices).where(and(eq(providerServices.userId, p.id), eq(providerServices.status, "approved")));
      
      if (serviceId) {
        if (!pServices.some(s => s.serviceId === serviceId)) continue;
      }
      
      result.push({ ...p, providedServices: pServices });
    }
    
    return result;
  }

  async getProvider(id: number): Promise<(User & { providedServices: ProviderService[] }) | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.id, id), eq(users.role, "provider")));
    if (!user) return undefined;
    
    const pServices = await db.select().from(providerServices).where(and(eq(providerServices.userId, user.id), eq(providerServices.status, "approved")));
    return { ...user, providedServices: pServices };
  }

  async addProviderService(service: InsertProviderService): Promise<ProviderService> {
    const [newService] = await db.insert(providerServices).values({ ...service, status: "pending" }).returning();
    return newService;
  }

  async updateProviderServiceStatus(id: number, status: "approved" | "rejected"): Promise<ProviderService | undefined> {
    const [updated] = await db.update(providerServices).set({ status }).where(eq(providerServices.id, id)).returning();
    return updated;
  }

  async getPendingProviderServices(): Promise<(ProviderService & { service: Service, provider: User })[]> {
    const pending = await db.select().from(providerServices).where(eq(providerServices.status, "pending")).orderBy(desc(providerServices.createdAt));
    const result = [];
    for (const p of pending) {
      const [service] = await db.select().from(services).where(eq(services.id, p.serviceId));
      const [provider] = await db.select().from(users).where(eq(users.id, p.userId));
      if (service && provider) {
        result.push({ ...p, service, provider });
      }
    }
    return result;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBookings(userId: number, role: "client" | "provider" | "admin"): Promise<(Booking & { service: Service, provider: User, client: User })[]> {
    let whereClause;
    if (role === "client") whereClause = eq(bookings.clientId, userId);
    else if (role === "provider") whereClause = eq(bookings.providerId, userId);
    else whereClause = undefined; // Admin sees all

    const bookingsList = await db.select().from(bookings).where(whereClause);
    
    const detailedBookings = [];
    for (const b of bookingsList) {
      const [service] = await db.select().from(services).where(eq(services.id, b.serviceId));
      const [provider] = await db.select().from(users).where(eq(users.id, b.providerId));
      const [client] = await db.select().from(users).where(eq(users.id, b.clientId));
      
      if (service && provider && client) {
        detailedBookings.push({ ...b, service, provider, client });
      }
    }
    return detailedBookings;
  }

  async hasCountries(): Promise<boolean> {
    const [c] = await db.select().from(countries).limit(1);
    return !!c;
  }
}

export const storage = new DatabaseStorage();
