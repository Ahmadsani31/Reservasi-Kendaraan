import React from 'react';
import { cn } from '@/lib/utils';
import { SmartphoneIcon, TabletIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileOnlyDesktopBlockingProps {
    children: React.ReactNode;
    className?: string;
}

const MobileOnlyDesktopBlocking = ({ children, className, ...props }: MobileOnlyDesktopBlockingProps) => {
    const isMobileOrTablet = useIsMobile();

    if (isMobileOrTablet) {
        // On mobile devices or tablets, render the children normally
        return <>{children}</>;
    }

    // On desktop, show the notice instead of the content
    return (
        <div className={cn("fixed inset-0 flex items-center justify-center bg-background z-50", className)} {...props}>
            <div className="max-w-md text-center p-6">
                <div className="flex justify-center gap-2 mb-4">
                    <SmartphoneIcon className="h-16 w-16 text-primary animate-fade-in" />
                    <TabletIcon className="h-20 w-20 text-primary animate-fade-in" style={{ animationDelay: '50ms' }} />
                </div>
                <h2 className="text-2xl font-medium mb-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
                    Mobile & Tablet View Only
                </h2>
                <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '200ms' }}>
                    This experience is designed for mobile devices and tablets.
                    Please view on a smartphone, tablet, or resize your browser window to a smaller size.
                </p>
            </div>
        </div>
    );
};

export default MobileOnlyDesktopBlocking;