import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { TransactionList } from "@/components/transaction-list";
import { Navigation } from "@/components/navigation";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Wallet() {
  const { user, isAuthenticated, isLoading } = useAuth();
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

  const { data: membership } = useQuery({
    queryKey: ["/api/membership"],
    retry: false,
    enabled: isAuthenticated,
  }) as { data: any };

  const { data: transactions } = useQuery({
    queryKey: ["/api/transactions"],
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

  const formatBalance = (balance: string, currency: string) => {
    const amount = parseFloat(balance);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'MXN' ? 'USD' : currency,
      minimumFractionDigits: 2,
    }).format(currency === 'MXN' ? amount : amount / 17);
  };

  return (
    <div className="min-h-screen bg-luxury-cream pb-20">
      {/* Header */}
      <header className="luxury-gradient text-white px-6 py-4">
        <h1 className="text-xl font-playfair font-semibold">{t('wallet')}</h1>
      </header>

      {/* Wallet Overview */}
      {membership && (
        <section className="px-6 py-6">
          <Card className="luxury-gold-gradient rounded-2xl p-6 text-white shadow-lg mb-6">
            <div className="text-center">
              <p className="text-sm opacity-90 mb-2">{t('currentBalance')}</p>
              <p className="text-4xl font-bold mb-4">
                {formatBalance(membership.balance, membership.currency)}
              </p>
              <p className="text-sm opacity-75">
                {membership.currency === 'MXN' ? 
                  `${parseFloat(membership.balance).toLocaleString()} MXN` :
                  `${membership.balance} ${membership.currency}`
                }
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4 text-center border-luxury-mint">
              <p className="text-sm text-gray-600 mb-1">{t('discount')}</p>
              <p className="text-2xl font-bold text-luxury-green">{membership.discountPercentage}%</p>
            </Card>
            <Card className="p-4 text-center border-luxury-mint">
              <p className="text-sm text-gray-600 mb-1">{t('vipEvents')}</p>
              <p className="text-2xl font-bold text-luxury-gold">
                {membership.vipEventsRemaining === 999 ? '∞' : membership.vipEventsRemaining}
              </p>
            </Card>
          </div>
        </section>
      )}

      {/* Transaction History */}
      {transactions && (
        <TransactionList transactions={transactions} />
      )}

      {/* Navigation */}
      <Navigation />
    </div>
  );
}
