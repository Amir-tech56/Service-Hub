import { useServices } from "@/hooks/use-data";
import { ServiceCard } from "@/components/ServiceCard";
import { useLanguage } from "@/hooks/use-language";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Services() {
  const { data: services, isLoading } = useServices();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  const filteredServices = services?.filter(s => 
    s.nameEn.toLowerCase().includes(search.toLowerCase()) || 
    s.nameFr.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-secondary/30 py-12">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">{t("nav.services")}</h1>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
            <Input 
              className="pl-10 h-12 rounded-xl bg-background border-2 focus-visible:ring-offset-0" 
              placeholder={t("search.placeholder")} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredServices?.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {!isLoading && filteredServices?.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            No services found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
