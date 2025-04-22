
import React from 'react';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const ActionButton = ({ children, onClick, className }: ActionButtonProps) => {
  return (
    <button 
      className={cn("action-button shadow-lg hover:bg-primary/90 active:scale-95", className)}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default ActionButton;
