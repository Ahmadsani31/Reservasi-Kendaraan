
import React from 'react';
import { cn } from '@/lib/utils';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

const MobileContainer = ({ children, className }: MobileContainerProps) => {
  return (
    <div className={cn("mobile-container", className)}>
      {children}
    </div>
  );
};

export default MobileContainer;
