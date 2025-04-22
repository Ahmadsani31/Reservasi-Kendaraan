
import React from 'react';
import MobileContainer from '@/components/MobileContainer';
import MobileOnlyNotice from '@/components/MobileOnlyNotice';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import { LogOutIcon, MoonIcon, SettingsIcon, SunIcon, UserIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const Profile = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logout berhasil!');
  };



  return (
    <>
      {/* <MobileOnlyNotice /> */}

      <Header title="Profile" />

      <MobileContainer className="pt-24 pb-28">
        <div className="flex flex-col items-center mb-8 animate-fade-in opacity-0">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <UserIcon className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium">{user.name}</h2>
          <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
        </div>

        <div className="space-y-4">
          <div className="content-card" style={{ animationDelay: '100ms' }}>
            {/* <h3 className="text-lg font-medium mb-4">Account Settings</h3> */}

            <div className="space-y-3">
              {/* <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center">
                  <SettingsIcon className="w-5 h-5 mr-3 text-muted-foreground" />
                  <span>Preferences</span>
                </div>
              </button> */}
              <div className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center">
                  {isDarkMode ? (
                    <MoonIcon className="w-5 h-5 mr-3 text-muted-foreground" />
                  ) : (
                    <SunIcon className="w-5 h-5 mr-3 text-muted-foreground" />
                  )}
                  <span className="text-foreground">Dark Mode</span>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
                  aria-label="Toggle dark mode"
                />
              </div>

              <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors" onClick={handleLogout}>
                <div className="flex items-center">
                  <LogOutIcon className="w-5 h-5 mr-3 text-muted-foreground" />
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </MobileContainer>

      <Navbar />
    </>
  );
};

export default Profile;
