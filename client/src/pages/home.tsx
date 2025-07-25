import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, History, Gift, Star, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MembershipCard } from "@/components/membership-card";
import { TransactionList } from "@/components/transaction-list";
import { Navigation } from "@/components/navigation";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MEMBERSHIP_TIERS } from "@/types/membership";
import { generateWalletPassData } from "@/lib/qr-generator";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [showAdmin, setShowAdmin] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);

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

  const { data: membership, isLoading: membershipLoading } = useQuery({
    queryKey: ["/api/membership"],
    retry: false,
    enabled: isAuthenticated,
  }) as { data: any; isLoading: boolean };

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    retry: false,
    enabled: isAuthenticated,
  }) as { data: any[]; isLoading: boolean };

  const { data: events } = useQuery({
    queryKey: ["/api/events"],
    retry: false,
    enabled: isAuthenticated,
  }) as { data: any[] };

  const { data: welcomeGifts } = useQuery({
    queryKey: ["/api/welcome-gifts"],
    retry: false,
    enabled: isAuthenticated,
  }) as { data: any[] };

  if (isLoading || membershipLoading) {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-luxury-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-luxury-dark">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !membership) {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <Card className="p-6 max-w-md mx-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Welcome to Luxe Wellness</h2>
            <p className="text-gray-600 mb-4">You don't have an active membership yet.</p>
            <Button 
              className="luxury-gradient text-white"
              onClick={() => setShowTierModal(true)}
            >
              Choose Membership
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleAddToWallet = () => {
    const passData = generateWalletPassData(membership, user);
    const dataStr = JSON.stringify(passData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'luxe-wellness-pass.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Wallet Pass Generated",
      description: "Your membership pass has been downloaded. Add it to your wallet app.",
    });
  };

  return (
    <div className="min-h-screen bg-luxury-cream pb-20">
      {/* Header */}
      <header className="luxury-gradient text-white px-6 py-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-luxury-gold rounded-full flex items-center justify-center">
              <i className="fas fa-spa text-luxury-green text-sm"></i>
            </div>
            <h1 className="text-xl font-playfair font-semibold">{t('luxeWellness')}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-luxury-gold rounded-full"></span>
            </button>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
              className="bg-transparent text-sm border border-white/30 rounded px-2 py-1"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="px-6 py-6 luxury-mint-gradient">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-luxury-sage/20">
            <img
              src={user.profileImageUrl || "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
              alt="Profile picture"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-luxury-dark">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-luxury-sage text-sm">{t('welcome')}</p>
          </div>
        </div>

        {/* Membership Card */}
        <MembershipCard
          membership={membership}
          user={user}
          onClick={() => setShowTierModal(true)}
        />

        {/* Apple Wallet Integration */}
        <div className="bg-black rounded-2xl p-4 mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <i className="fab fa-apple text-white text-lg"></i>
              <span className="text-white text-sm font-medium">Wallet</span>
            </div>
            <Button 
              size="sm" 
              variant="secondary" 
              className="bg-white/20 text-white hover:bg-white/30"
              onClick={handleAddToWallet}
            >
              {t('addToWallet')}
            </Button>
          </div>
          <div className="luxury-gold-gradient rounded-xl p-3 relative">
            <div className="text-white">
              <p className="text-xs opacity-80">LUXE WELLNESS</p>
              <p className="font-semibold text-sm">{t(`${membership.tier}Member` as any)}</p>
              <div className="mt-2 flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-80">Member</p>
                  <p className="text-sm">{user.firstName} {user.lastName}</p>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                  <i className="fas fa-spa text-xs"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-luxury-dark">{t('quickActions')}</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-auto flex-col space-y-2 p-4 border-luxury-mint hover:bg-luxury-mint/20"
          >
            <Calendar className="text-luxury-green text-xl" />
            <span className="text-sm font-medium text-luxury-dark">{t('bookTreatment')}</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col space-y-2 p-4 border-luxury-mint hover:bg-luxury-mint/20"
          >
            <History className="text-luxury-green text-xl" />
            <span className="text-sm font-medium text-luxury-dark">{t('viewHistory')}</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col space-y-2 p-4 border-luxury-mint hover:bg-luxury-mint/20"
          >
            <Gift className="text-luxury-green text-xl" />
            <span className="text-sm font-medium text-luxury-dark">{t('redeemGifts')}</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col space-y-2 p-4 border-luxury-mint hover:bg-luxury-mint/20"
          >
            <Star className="text-luxury-green text-xl" />
            <span className="text-sm font-medium text-luxury-dark">{t('vipEvents')}</span>
          </Button>
        </div>
      </section>

      {/* Recent Transactions */}
      {transactions && (
        <TransactionList transactions={transactions.slice(0, 3)} />
      )}

      {/* Exclusive Offers */}
      <section className="px-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-luxury-dark">{t('memberExclusives')}</h3>
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-sm border border-luxury-mint">
            <img
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
              alt="Luxury spa treatment room"
              className="w-full h-32 object-cover"
            />
            <div className="p-4">
              <h4 className="font-semibold mb-2">VIP Spring Wellness Event</h4>
              <p className="text-sm text-gray-600 mb-3">
                Exclusive access to our new treatment launch with complimentary consultation.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-luxury-gold font-medium text-sm">{t('goldPlusOnly')}</span>
                <Button size="sm" className="luxury-gradient text-white">
                  {t('rsvpNow')}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="luxury-gradient p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold mb-1">{t('doublePointsWeekend')}</h4>
                <p className="text-sm opacity-90">{t('earnDoublePoints')}</p>
                <p className="text-xs opacity-75 mt-1">Valid Feb 10-12</p>
              </div>
              <div className="text-right">
                <Star className="text-2xl opacity-80" />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Admin Panel */}
      {showAdmin && user.isAdmin && (
        <section className="px-6 mb-6">
          <Card className="bg-luxury-dark text-white p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-user-shield mr-2"></i>
              {t('staffDashboard')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20">
                <Plus className="mr-1" size={16} />
                {t('addBalance')}
              </Button>
              <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20">
                <i className="fas fa-minus-circle mr-1"></i>
                {t('deductBalance')}
              </Button>
              <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20">
                <i className="fas fa-qrcode mr-1"></i>
                {t('scanQr')}
              </Button>
              <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20">
                <i className="fas fa-receipt mr-1"></i>
                {t('generateReceipt')}
              </Button>
            </div>
          </Card>
        </section>
      )}

      {/* Membership Tier Modal */}
      <Dialog open={showTierModal} onOpenChange={setShowTierModal}>
        <DialogContent className="max-w-sm w-full max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-playfair">{t('membershipTiers')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => (
              <Card key={key} className={`p-4 ${membership?.tier === key ? 'border-2 border-luxury-gold bg-luxury-gold/5' : 'border border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold capitalize">{key}</h4>
                  {key === 'gold' && <i className="fas fa-crown text-luxury-gold"></i>}
                  {key === 'platinum' && <i className="fas fa-gem text-luxury-dark"></i>}
                  {key === 'silver' && <i className="fas fa-medal text-gray-400"></i>}
                </div>
                <p className="text-2xl font-bold text-luxury-dark mb-2">
                  ${tier.price.toLocaleString()} {tier.currency}
                </p>
                <ul className="text-sm space-y-1 text-gray-600">
                  {tier.benefits.map((benefit, index) => (
                    <li key={index}>• {benefit}</li>
                  ))}
                </ul>
              </Card>
            ))}

            <Button 
              className="w-full luxury-gradient text-white"
              onClick={() => setShowTierModal(false)}
            >
              {t('upgradeMembership')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navigation */}
      <Navigation onAdminToggle={() => setShowAdmin(!showAdmin)} />
    </div>
  );
}
