import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Waves, Crown, Gift, Star } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function Landing() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-luxury-cream">
      {/* Header */}
      <header className="luxury-gradient text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-luxury-gold rounded-full flex items-center justify-center">
              <Waves className="text-luxury-green text-sm" />
            </div>
            <h1 className="text-xl font-playfair font-semibold">{t('luxeWellness')}</h1>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
            className="bg-transparent text-sm border border-white/30 rounded px-2 py-1"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-12 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-playfair font-bold text-luxury-dark mb-4">
            Premium Wellness Membership
          </h2>
          <p className="text-luxury-sage mb-8">
            Experience luxury wellness with exclusive benefits, digital wallet, and VIP access to our premium treatments.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="p-4 border-luxury-mint">
              <CardContent className="p-0 text-center">
                <Crown className="text-luxury-gold mx-auto mb-2" size={24} />
                <p className="text-sm font-medium">Tiered Benefits</p>
              </CardContent>
            </Card>
            <Card className="p-4 border-luxury-mint">
              <CardContent className="p-0 text-center">
                <Gift className="text-luxury-green mx-auto mb-2" size={24} />
                <p className="text-sm font-medium">Welcome Gifts</p>
              </CardContent>
            </Card>
            <Card className="p-4 border-luxury-mint">
              <CardContent className="p-0 text-center">
                <Star className="text-luxury-bronze mx-auto mb-2" size={24} />
                <p className="text-sm font-medium">VIP Events</p>
              </CardContent>
            </Card>
            <Card className="p-4 border-luxury-mint">
              <CardContent className="p-0 text-center">
                <Waves className="text-luxury-sage mx-auto mb-2" size={24} />
                <p className="text-sm font-medium">Digital Wallet</p>
              </CardContent>
            </Card>
          </div>

          <Button 
            size="lg" 
            className="w-full luxury-gradient text-white font-medium"
            onClick={() => window.location.href = '/api/login'}
          >
            {t('login')}
          </Button>
        </div>
      </section>

      {/* Membership Tiers Preview */}
      <section className="px-6 py-8 bg-white/50">
        <h3 className="text-xl font-playfair font-semibold text-center mb-6">{t('membershipTiers')}</h3>
        <div className="space-y-4 max-w-md mx-auto">
          <Card className="p-4 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Silver</h4>
                <p className="text-2xl font-bold text-luxury-dark">$12,000 MXN</p>
                <p className="text-sm text-gray-600">5% discount • 1 VIP event</p>
              </div>
              <Crown className="text-gray-400" size={24} />
            </div>
          </Card>
          
          <Card className="p-4 border-luxury-gold bg-luxury-gold/5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Gold</h4>
                <p className="text-2xl font-bold text-luxury-dark">$20,000 MXN</p>
                <p className="text-sm text-gray-600">10% discount • 2 VIP events</p>
              </div>
              <Crown className="text-luxury-gold" size={24} />
            </div>
          </Card>
          
          <Card className="p-4 border-luxury-dark bg-luxury-dark/5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Platinum</h4>
                <p className="text-2xl font-bold text-luxury-dark">$30,000 MXN</p>
                <p className="text-sm text-gray-600">15% discount • All VIP events</p>
              </div>
              <Star className="text-luxury-dark" size={24} />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
