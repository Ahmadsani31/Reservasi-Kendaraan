
import React from 'react';
import { cn } from '@/lib/utils';
import { SmartphoneIcon } from 'lucide-react';

interface MobileOnlyNoticeProps {
  className?: string;
}

const MobileOnlyNotice = ({ className }: MobileOnlyNoticeProps) => {
  return (
    <div className={cn("mobile-only-notice", className)}>
      <div className="max-w-md text-center p-6">
        <SmartphoneIcon className="h-20 w-20 mx-auto mb-4 text-primary animate-fade-in" />
        <h2 className="text-2xl font-medium mb-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
          Mobile View Only
        </h2>
        <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '200ms' }}>
          This experience is designed exclusively for mobile devices. 
          Please view on a smartphone or resize your browser window to a mobile size.
        </p>
      </div>
    </div>
  );
};

export default MobileOnlyNotice;
