import { Link, useLocation } from "wouter";
import { Home, Wallet, Calendar, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const MobileNavigation = () => {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const navItems = [
    {
      path: "/",
      icon: Home,
      label: "Home",
      active: location === "/"
    },
    {
      path: "/wallet",
      icon: Wallet,
      label: "Wallet",
      active: location === "/wallet"
    },
    {
      path: "/bookings",
      icon: Calendar,
      label: "Events",
      active: location === "/bookings"
    },
    {
      path: "/profile",
      icon: User,
      label: "Profile",
      active: location === "/profile"
    }
  ];

  // Add admin page if user is admin
  if ((user as any)?.isAdmin) {
    navItems.push({
      path: "/admin",
      icon: Settings,
      label: "Admin",
      active: location === "/admin"
    });
  }

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`mobile-nav-item touch-target haptic-light ${
              item.active ? "active" : ""
            }`}
          >
            <IconComponent />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNavigation;