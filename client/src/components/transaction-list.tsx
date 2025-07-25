import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors, ShoppingBag, Plus, CreditCard } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface Transaction {
  id: string;
  type: string;
  amount: string;
  currency: string;
  description: string;
  discountApplied?: string;
  createdAt: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onViewAll?: () => void;
}

export function TransactionList({ transactions, onViewAll }: TransactionListProps) {
  const { t } = useLanguage();

  const formatAmount = (amount: string, currency: string) => {
    const value = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'MXN' ? 'USD' : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(currency === 'MXN' ? value : value / 17);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTransactionIcon = (description: string, type: string) => {
    if (type === 'credit' || type === 'topup') {
      return <Plus className="text-green-600" />;
    }
    if (description.toLowerCase().includes('facial') || description.toLowerCase().includes('treatment')) {
      return <Scissors className="text-luxury-green" />;
    }
    if (description.toLowerCase().includes('product') || description.toLowerCase().includes('retail')) {
      return <ShoppingBag className="text-luxury-green" />;
    }
    return <CreditCard className="text-luxury-green" />;
  };

  const getAmountColor = (type: string) => {
    return type === 'credit' || type === 'topup' ? 'text-green-600' : 'text-red-500';
  };

  const getAmountPrefix = (type: string) => {
    return type === 'credit' || type === 'topup' ? '+' : '-';
  };

  return (
    <section className="px-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-luxury-dark">{t('recentActivity')}</h3>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-luxury-green">
            {t('viewAll')}
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="p-4 shadow-sm border border-luxury-mint">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-luxury-mint rounded-full flex items-center justify-center">
                  {getTransactionIcon(transaction.description, transaction.type)}
                </div>
                <div>
                  <p className="font-medium text-sm">{transaction.description}</p>
                  <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
                  {getAmountPrefix(transaction.type)}{formatAmount(transaction.amount, transaction.currency)} {transaction.currency}
                </p>
                {transaction.discountApplied && parseFloat(transaction.discountApplied) > 0 && (
                  <p className="text-xs text-gray-500">{t('discountApplied')}</p>
                )}
                {transaction.type === 'topup' && (
                  <p className="text-xs text-gray-500">{t('creditCard')}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
        
        {transactions.length === 0 && (
          <Card className="p-8 text-center border border-luxury-mint">
            <p className="text-gray-500">{t('recentActivity')}</p>
          </Card>
        )}
      </div>
    </section>
  );
}
