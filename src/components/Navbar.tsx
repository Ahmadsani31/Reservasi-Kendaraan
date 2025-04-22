
import React from 'react';
import { cn } from '@/lib/utils';
import { HomeIcon, ClipboardList, CarIcon, UserIcon, BellIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavbarItem = ({ icon, label, active, onClick }: NavbarItemProps) => {
  return (
    <button
      className={cn("navbar-item", active && "active")}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
};

interface NavbarProps {
  className?: string;
}

const Navbar = React.memo(({ className }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { icon: <HomeIcon className="h-6 w-6" />, label: 'Home', path: '/' },
    { icon: <ClipboardList className="h-6 w-6" />, label: 'Perjalanan', path: '/reservasi' },
    { icon: <CarIcon className="h-6 w-6" />, label: 'Kendaraan', path: '/kendaraan' },
    { icon: <UserIcon className="h-6 w-6" />, label: 'Profile', path: '/profile' }
  ];

  return (
    <nav className={cn("navbar", className)}>
      <div className="navbar-menu">
        {navItems.map((item) => (
          <NavbarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={path === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>
    </nav>
  );
});

export default Navbar;
