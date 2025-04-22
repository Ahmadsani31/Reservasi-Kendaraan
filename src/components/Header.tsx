
import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  className?: string;
}

const Header = React.memo(({ title, className }: HeaderProps) => {

  return (
    <header className={cn("header-blur", className)}>
      <div className="flex items-center justify-between max-w-screen-sm mx-auto">
        <h1 className="text-xl font-medium">{title}</h1>
      </div>
    </header>
  );
});

export default Header;
