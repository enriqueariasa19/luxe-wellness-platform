import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Crown, Gift, Star, LogOut, Globe } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
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

  const { data: membership } = useQuery({
    queryKey: ["/api/membership"],
    retry: false,
    enabled: isAuthenticated,
  }) as { data: any };

  const { data: welcomeGifts } = useQuery({
    queryKey: ["/api/welcome-gifts"],
    retry: false,
    enabled: isAuthenticated,
  }) as { data: any[] };

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

  if (!user) return null;

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'gold':
        return <Crown className="text-luxury-gold" size={20} />;
      case 'platinum':
        return <Star className="text-luxury-dark" size={20} />;
      default:
        return <Crown className="text-gray-400" size={20} />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'gold':
        return 'bg-luxury-gold text-white';
      case 'platinum':
        return 'bg-luxury-dark text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-luxury-cream pb-20">
      {/* Header */}
      <header className="luxury-gradient text-white px-6 py-4">
        <h1 className="text-xl font-playfair font-semibold">{t('profile')}</h1>
      </header>

      {/* Profile Section */}
      <section className="px-6 py-6">
        <Card className="p-6 border-luxury-mint mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-luxury-sage/20">
              <img
                src={user.profileImageUrl || "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
                alt="Profile picture"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-luxury-dark">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              {membership && (
                <div className="flex items-center mt-2">
                  {getTierIcon(membership.tier)}
                  <Badge className={`ml-2 ${getTierColor(membership.tier)}`}>
                    {t(`${membership.tier}Member` as any)}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Membership Details */}
        {membership && (
          <Card className="p-6 border-luxury-mint mb-6">
            <h3 className="text-lg font-semibold mb-4 text-luxury-dark">Membership Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tier</span>
                <span className="font-semibold capitalize">{membership.tier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount Rate</span>
                <span className="font-semibold">{membership.discountPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VIP Events Remaining</span>
                <span className="font-semibold">
                  {membership.vipEventsRemaining === 999 ? 'Unlimited' : membership.vipEventsRemaining}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expires</span>
                <span className="font-semibold">{formatExpiryDate(membership.expiresAt)}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Welcome Gifts */}
        {welcomeGifts && welcomeGifts.length > 0 && (
          <Card className="p-6 border-luxury-mint mb-6">
            <h3 className="text-lg font-semibold mb-4 text-luxury-dark flex items-center">
              <Gift className="mr-2 text-luxury-gold" />
              Welcome Gifts
            </h3>
            <div className="space-y-3">
              {welcomeGifts.map((gift: any) => (
                <div key={gift.id} className="flex justify-between items-center p-3 bg-luxury-mint/20 rounded-lg">
                  <div>
                    <p className="font-medium">{gift.giftType.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-sm text-gray-600">{gift.description}</p>
                  </div>
                  <Badge variant={gift.isRedeemed ? "secondary" : "default"}>
                    {gift.isRedeemed ? "Redeemed" : "Available"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Settings */}
        <Card className="p-6 border-luxury-mint mb-6">
          <h3 className="text-lg font-semibold mb-4 text-luxury-dark">Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="mr-3 text-luxury-green" />
                <span>Language</span>
              </div>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
                className="border border-luxury-mint rounded px-3 py-1 bg-white"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => window.location.href = '/api/logout'}
        >
          <LogOut className="mr-2" size={16} />
          {t('logout')}
        </Button>
      </section>

      {/* Navigation */}
      <Navigation />
    </div>
  );
}
