
import React from 'react';
import MobileContainer from '@/components/MobileContainer';
import MobileOnlyNotice from '@/components/MobileOnlyNotice';
import ActionButton from '@/components/ActionButton';
import { useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      {/* <MobileOnlyNotice /> */}

      <MobileContainer className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center animate-fade-in opacity-0">
          <div className="text-9xl font-light text-primary/30 mb-4">404</div>
          <h1 className="text-2xl font-medium mb-3">Page not found</h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <ActionButton
            onClick={() => navigate('/')}
            className="mx-auto"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Back to Home
          </ActionButton>
        </div>
      </MobileContainer>
    </>
  );
};

export default NotFound;
