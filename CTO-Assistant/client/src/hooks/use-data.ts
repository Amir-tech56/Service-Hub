import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertBooking } from "@shared/routes";

// === LOCATIONS ===
export function useCountries() {
  return useQuery({
    queryKey: [api.locations.countries.path],
    queryFn: async () => {
      const res = await fetch(api.locations.countries.path);
      if (!res.ok) throw new Error("Failed to fetch countries");
      return api.locations.countries.responses[200].parse(await res.json());
    },
  });
}

export function useCities(countryId?: number) {
  return useQuery({
    queryKey: [api.locations.cities.path, countryId],
    enabled: !!countryId,
    queryFn: async () => {
      const url = buildUrl(api.locations.cities.path, { countryId: countryId! });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch cities");
      return api.locations.cities.responses[200].parse(await res.json());
    },
  });
}

// === SERVICES ===
export function useServices() {
  return useQuery({
    queryKey: [api.services.list.path],
    queryFn: async () => {
      const res = await fetch(api.services.list.path);
      if (!res.ok) throw new Error("Failed to fetch services");
      return api.services.list.responses[200].parse(await res.json());
    },
  });
}

// === PROVIDERS ===
export function useProviders(filters?: { cityId?: number; serviceId?: number }) {
  return useQuery({
    queryKey: [api.providers.list.path, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.cityId) params.append("cityId", filters.cityId.toString());
      if (filters?.serviceId) params.append("serviceId", filters.serviceId.toString());
      
      const res = await fetch(`${api.providers.list.path}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch providers");
      return api.providers.list.responses[200].parse(await res.json());
    },
  });
}

export function useProvider(id: number) {
  return useQuery({
    queryKey: [api.providers.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.providers.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch provider");
      return api.providers.get.responses[200].parse(await res.json());
    },
  });
}

// === BOOKINGS ===
export function useBookings() {
  return useQuery({
    queryKey: [api.bookings.list.path],
    queryFn: async () => {
      const res = await fetch(api.bookings.list.path);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return api.bookings.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBooking) => {
      const res = await fetch(api.bookings.create.path, {
        method: api.bookings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = api.bookings.create.responses[400].parse(await res.json());
          throw new Error(err.message);
        }
        throw new Error("Failed to create booking");
      }
      return api.bookings.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
    },
  });
}
