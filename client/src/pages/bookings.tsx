import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Bookings() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: events } = useQuery({
    queryKey: ["/api/events"],
    retry: false,
    enabled: isAuthenticated,
  }) as { data: any[] };

  const { data: membership } = useQuery({
    queryKey: ["/api/membership"],
    retry: false,
    enabled: isAuthenticated,
  }) as { data: any };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-luxury-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-luxury-dark">Loading...</p>
        </div>
      </div>
    );
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canAccessEvent = (requiredTier: string) => {
    if (!membership) return false;
    const tierOrder = { silver: 1, gold: 2, platinum: 3 };
    return tierOrder[membership.tier as keyof typeof tierOrder] >= tierOrder[requiredTier as keyof typeof tierOrder];
  };

  return (
    <div className="min-h-screen bg-luxury-cream pb-20">
      {/* Header */}
      <header className="luxury-gradient text-white px-6 py-4">
        <h1 className="text-xl font-playfair font-semibold">{t('bookings')}</h1>
      </header>

      {/* Upcoming Bookings */}
      <section className="px-6 py-6">
        <h2 className="text-lg font-semibold mb-4 text-luxury-dark">Upcoming Appointments</h2>
        <Card className="p-6 border-luxury-mint text-center">
          <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-500 mb-4">No upcoming appointments</p>
          <Button className="luxury-gradient text-white">
            {t('bookTreatment')}
          </Button>
        </Card>
      </section>

      {/* VIP Events */}
      {events && events.length > 0 && (
        <section className="px-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-luxury-dark">{t('vipEvents')}</h2>
          <div className="space-y-4">
            {events.map((event: any) => (
              <Card key={event.id} className="p-4 border-luxury-mint">
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatEventDate(event.eventDate)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.requiredTier === 'platinum' ? 'bg-luxury-dark text-white' :
                      event.requiredTier === 'gold' ? 'bg-luxury-gold text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {event.requiredTier.charAt(0).toUpperCase() + event.requiredTier.slice(1)}+
                    </span>
                  </div>
                </div>
                <Button 
                  className={`w-full ${canAccessEvent(event.requiredTier) ? 'luxury-gradient text-white' : ''}`}
                  variant={canAccessEvent(event.requiredTier) ? 'default' : 'outline'}
                  disabled={!canAccessEvent(event.requiredTier)}
                >
                  {canAccessEvent(event.requiredTier) ? t('rsvpNow') : 'Tier Upgrade Required'}
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-luxury-dark">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3">
          <Button variant="outline" className="justify-start p-4 h-auto border-luxury-mint">
            <Calendar className="mr-3 text-luxury-green" />
            <div className="text-left">
              <p className="font-medium">Book New Treatment</p>
              <p className="text-sm text-gray-600">Schedule your next wellness session</p>
            </div>
          </Button>
          
          <Button variant="outline" className="justify-start p-4 h-auto border-luxury-mint">
            <Clock className="mr-3 text-luxury-green" />
            <div className="text-left">
              <p className="font-medium">View Treatment History</p>
              <p className="text-sm text-gray-600">See your past appointments</p>
            </div>
          </Button>
          
          <Button variant="outline" className="justify-start p-4 h-auto border-luxury-mint">
            <MapPin className="mr-3 text-luxury-green" />
            <div className="text-left">
              <p className="font-medium">Clinic Locations</p>
              <p className="text-sm text-gray-600">Find our nearest location</p>
            </div>
          </Button>
        </div>
      </section>

      {/* Navigation */}
      <Navigation />
    </div>
  );
}
