import { useProviders, useServices, useCities } from "@/hooks/use-data";
import { ProviderCard } from "@/components/ProviderCard";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

export default function Providers() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialServiceId = searchParams.get("serviceId");

  const [selectedService, setSelectedService] = useState<number | undefined>(
    initialServiceId ? Number(initialServiceId) : undefined
  );
  const [selectedCity, setSelectedCity] = useState<number | undefined>();

  const { data: providers, isLoading } = useProviders({ 
    serviceId: selectedService,
    cityId: selectedCity
  });
  
  const { data: services } = useServices();
  const { data: cities } = useCities(1); // Assuming Country ID 1 for MVP

  return (
    <div className="min-h-screen bg-secondary/30 py-12">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Service Providers</h1>
            <p className="text-muted-foreground mt-2">Find the right professional for your needs</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="w-full sm:w-48">
              <Label className="mb-2 block">Service</Label>
              <select 
                className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                value={selectedService || ""}
                onChange={(e) => setSelectedService(Number(e.target.value) || undefined)}
              >
                <option value="">All Services</option>
                {services?.map(s => (
                  <option key={s.id} value={s.id}>{s.nameEn}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full sm:w-48">
              <Label className="mb-2 block">City</Label>
              <select 
                className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                value={selectedCity || ""}
                onChange={(e) => setSelectedCity(Number(e.target.value) || undefined)}
              >
                <option value="">All Cities</option>
                {cities?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
            ))
          ) : providers?.length ? (
            providers.map((provider) => (
              <ProviderCard 
                key={provider.id} 
                provider={provider} 
                services={services || []} 
              />
            ))
          ) : (
            <div className="col-span-full py-24 text-center text-muted-foreground bg-card rounded-2xl border border-dashed">
              No providers found matching these filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
