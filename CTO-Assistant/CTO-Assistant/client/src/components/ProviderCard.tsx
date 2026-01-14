import { User, ProviderService, Service } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, MessageCircle } from "lucide-react";
import { useCreateBooking } from "@/hooks/use-data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProviderWithServices = User & { providedServices: ProviderService[] };

export function ProviderCard({ 
  provider, 
  services 
}: { 
  provider: ProviderWithServices; 
  services: Service[] 
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    provider.providedServices[0]?.serviceId || null
  );
  const [date, setDate] = useState("");

  const handleBook = async () => {
    if (!user) {
      setLocation("/auth");
      return;
    }
    if (!selectedServiceId || !date) return;

    try {
      await createBooking.mutateAsync({
        providerId: provider.id,
        clientId: user.id,
        serviceId: selectedServiceId,
        status: "pending",
        scheduledDate: new Date(date),
      });
      toast({
        title: "Success",
        description: t("booking.success"),
      });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getServiceLabel = (sId: number) => {
    const s = services.find(svc => svc.id === sId);
    return s?.nameEn || "Service";
  };

  return (
    <div className="group flex flex-col md:flex-row bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-lg transition-all overflow-hidden">
      {/* Avatar / Image Section */}
      <div className="w-full md:w-48 bg-muted flex items-center justify-center p-6 shrink-0">
        <div className="size-24 rounded-full bg-primary/20 text-primary text-3xl font-bold flex items-center justify-center">
          {provider.name.charAt(0)}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold font-display">{provider.name}</h3>
              <div className="flex items-center text-muted-foreground mt-1 text-sm">
                <MapPin className="size-4 mr-1" />
                <span>City ID: {provider.cityId}</span>
              </div>
            </div>
            <div className="flex items-center bg-accent/10 text-accent-foreground px-2 py-1 rounded-lg">
              <Star className="size-4 fill-accent text-accent mr-1" />
              <span className="font-bold">{provider.rating}</span>
            </div>
          </div>

          <p className="mt-4 text-muted-foreground line-clamp-2">
            {provider.bio || "No bio available for this provider."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {provider.providedServices.map((ps) => (
              <span key={ps.id} className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-md">
                {getServiceLabel(ps.serviceId)}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                {t("provider.book")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book {provider.name}</DialogTitle>
                <DialogDescription>
                  Select a service and date to request an appointment.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Service</Label>
                  <select 
                    className="w-full p-2 rounded-md border bg-background"
                    value={selectedServiceId || ""}
                    onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                  >
                    {provider.providedServices.map(ps => (
                      <option key={ps.id} value={ps.serviceId}>
                        {getServiceLabel(ps.serviceId)} ({ps.priceRange || 'Price varies'})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input 
                    type="datetime-local" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleBook} disabled={createBooking.isPending}>
                  {createBooking.isPending ? "Booking..." : "Confirm Booking"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="icon">
            <Phone className="size-4" />
          </Button>
          <Button variant="outline" size="icon">
            <MessageCircle className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
