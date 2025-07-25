import { Card } from "@/components/ui/card";
import { Crown, Gift, QrCode } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { generateQRCodeSVG, generateQRData } from "@/lib/qr-generator";

interface MembershipCardProps {
  membership: {
    id: string;
    tier: string;
    balance: string;
    currency: string;
    discountPercentage: number;
    vipEventsRemaining: number;
    expiresAt: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  onClick?: () => void;
}

export function MembershipCard({ membership, user, onClick }: MembershipCardProps) {
  const { t } = useLanguage();

  const formatBalance = (balance: string, currency: string) => {
    const amount = parseFloat(balance);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'MXN' ? 'USD' : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(currency === 'MXN' ? amount : amount / 17); // Rough MXN to USD conversion
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'gold':
        return 'luxury-gold-gradient';
      case 'platinum':
        return 'bg-gradient-to-br from-luxury-dark to-gray-800';
      default:
        return 'bg-gradient-to-br from-luxury-bronze to-amber-700';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'gold':
        return <Crown className="text-2xl mb-2" />;
      case 'platinum':
        return <Gift className="text-2xl mb-2" />;
      default:
        return <Crown className="text-2xl mb-2 opacity-75" />;
    }
  };

  const qrData = generateQRData(membership.id, user.id);
  const qrCodeSVG = generateQRCodeSVG(qrData, 48);

  return (
    <Card 
      className={`${getTierColor(membership.tier)} rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden cursor-pointer transition-transform hover:scale-105`}
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm opacity-90">{t('membership')}</p>
            <h3 className="text-2xl font-playfair font-bold">
              {t(`${membership.tier}Member` as any)}
            </h3>
          </div>
          <div className="text-right">
            {getTierIcon(membership.tier)}
            <p className="text-xs opacity-80">{t('validUntil')}</p>
            <p className="text-sm font-semibold">{formatExpiryDate(membership.expiresAt)}</p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm opacity-90 mb-1">{t('currentBalance')}</p>
          <p className="text-3xl font-bold">
            {formatBalance(membership.balance, membership.currency)}
            <span className="text-lg ml-2">{membership.currency}</span>
          </p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <div className="text-center">
              <p className="text-xs opacity-80">{t('discount')}</p>
              <p className="font-semibold">{membership.discountPercentage}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs opacity-80">{t('vipEvents')}</p>
              <p className="font-semibold">
                {membership.vipEventsRemaining === 999 ? '∞' : membership.vipEventsRemaining}
              </p>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <div 
              dangerouslySetInnerHTML={{ __html: qrCodeSVG }} 
              className="w-8 h-8"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
