import { z } from 'zod';
import { 
  insertUserSchema, 
  insertCountrySchema, 
  insertCitySchema, 
  insertServiceSchema, 
  insertProviderServiceSchema,
  insertBookingSchema,
  insertReviewSchema,
  users, 
  countries, 
  cities, 
  services,
  providerServices,
  bookings,
  reviews
} from './schema';

// Shared error schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// API Contract
export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.internal,
      }
    },
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.object({ message: z.string() }),
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.internal,
      }
    }
  },
  locations: {
    countries: {
      method: 'GET' as const,
      path: '/api/countries',
      responses: {
        200: z.array(z.custom<typeof countries.$inferSelect>()),
      }
    },
    cities: {
      method: 'GET' as const,
      path: '/api/countries/:countryId/cities',
      responses: {
        200: z.array(z.custom<typeof cities.$inferSelect>()),
      }
    },
    manageCountries: {
      method: 'POST' as const,
      path: '/api/admin/countries',
      input: insertCountrySchema,
      responses: {
        201: z.custom<typeof countries.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    manageCities: {
      method: 'POST' as const,
      path: '/api/admin/cities',
      input: insertCitySchema,
      responses: {
        201: z.custom<typeof cities.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  },
  services: {
    list: {
      method: 'GET' as const,
      path: '/api/services',
      responses: {
        200: z.array(z.custom<typeof services.$inferSelect>()),
      }
    },
    manage: {
      method: 'POST' as const,
      path: '/api/admin/services',
      input: insertServiceSchema,
      responses: {
        201: z.custom<typeof services.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  },
  providers: {
    list: {
      method: 'GET' as const,
      path: '/api/providers',
      input: z.object({
        cityId: z.coerce.number().optional(),
        serviceId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect & { providedServices: typeof providerServices.$inferSelect[] }>()),
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/providers/:id',
      responses: {
        200: z.custom<typeof users.$inferSelect & { providedServices: typeof providerServices.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      }
    },
    registerService: {
      method: 'POST' as const,
      path: '/api/providers/services',
      input: insertProviderServiceSchema,
      responses: {
        201: z.custom<typeof providerServices.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    manageServiceApproval: {
      method: 'PATCH' as const,
      path: '/api/admin/provider-services/:id/approval',
      input: z.object({
        status: z.enum(["approved", "rejected"]),
      }),
      responses: {
        200: z.custom<typeof providerServices.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    listPendingServices: {
      method: 'GET' as const,
      path: '/api/admin/provider-services/pending',
      responses: {
        200: z.array(z.custom<typeof providerServices.$inferSelect & { service: typeof services.$inferSelect, provider: typeof users.$inferSelect }>()),
      }
    }
  },
  bookings: {
    create: {
      method: 'POST' as const,
      path: '/api/bookings',
      input: insertBookingSchema,
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    list: {
      method: 'GET' as const,
      path: '/api/bookings',
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect & { service: typeof services.$inferSelect, provider: typeof users.$inferSelect, client: typeof users.$inferSelect }>()),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
