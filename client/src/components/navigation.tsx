import { Home, Calendar, Wallet, User, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/components/language-provider";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  onAdminToggle?: () => void;
}

export function Navigation({ onAdminToggle }: NavigationProps) {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: t('home') },
    { path: '/bookings', icon: Calendar, label: t('bookings') },
    { path: '/wallet', icon: Wallet, label: t('wallet') },
    { path: '/profile', icon: User, label: t('profile') },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-luxury-mint">
      <div className="flex justify-around py-3">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center space-y-1 ${
                isActive ? 'text-luxury-green' : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
        
        <button
          onClick={onAdminToggle}
          className="flex flex-col items-center space-y-1 text-gray-400"
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs">{t('settings')}</span>
        </button>
      </div>
    </nav>
  );
}
