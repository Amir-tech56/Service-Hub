import { useAuth } from "@/hooks/use-auth";
import { useBookings } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();

  if (authLoading || bookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    );
  }

  // Filter bookings relevant to the user
  const myBookings = bookings?.filter(b => 
    user?.role === 'provider' ? b.providerId === user.id : b.clientId === user.id
  );

  return (
    <div className="min-h-screen bg-secondary/30 py-12">
      <div className="container px-4 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">
            {user?.role === 'provider' ? 'Provider Dashboard' : 'My Bookings'}
          </h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>

        {myBookings?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              You have no bookings yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myBookings?.map((booking) => (
              <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center">
                  {/* Status Indicator Stripe */}
                  <div className={`w-full md:w-2 h-2 md:h-auto self-stretch
                    ${booking.status === 'pending' ? 'bg-yellow-400' : 
                      booking.status === 'accepted' ? 'bg-blue-500' :
                      booking.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}
                  `} />
                  
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                      <div>
                        <h3 className="font-bold text-lg">
                          {booking.service.nameEn}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.scheduledDate!), "PPP 'at' p")}
                        </p>
                      </div>
                      <Badge className={`mt-2 md:mt-0 w-fit capitalize
                        ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          booking.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      `}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user?.role === 'provider' ? booking.client.name.charAt(0) : booking.provider.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user?.role === 'provider' ? 'Client' : 'Provider'}
                          </p>
                          <p className="text-muted-foreground">
                            {user?.role === 'provider' ? booking.client.name : booking.provider.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
