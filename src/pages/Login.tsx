
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MobileContainer from '@/components/MobileContainer';
// import { toast } from 'react-toastify';
import { toast } from 'sonner';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';

import CarRent from '@/assets/img/rental-car.png';

const Login = () => {

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });
  // const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect if already logged in
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = { username: '', password: '' };
    let isValid = true;

    if (!username) {
      newErrors.username = 'Email wajib diisi';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password wajib diisi';
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warning('Email & Password Required');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login({ username, password });
      // alert(success);

      if (success) {
        toast.success('Login berhasil!');
        navigate('/');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <>
      <MobileContainer className="flex flex-col items-center justify-center min-h-[90vh]">
        <div className='flex  justify-center mb-5'>
          <img src={CarRent} className='w-40 object-fill' alt="car" />
        </div>

        <div className="content-card w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Log-In</h2>


          <form onSubmit={handleLogin} className="space-y-4" method='POST'>
            <div className="mb-3">
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                autoComplete='email'
                onChange={(e) => setUsername(e.target.value)}
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && (
                <p className="text-sm ms-1 text-red-500">{errors.username}</p>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative w-full">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  autoComplete='current-password'
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm ms-1 text-red-500">{errors.password}</p>
                )}
                <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute top-1/2 -translate-y-1/2 right-2'>
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>
            </div>

            {/* <Button type="submit" className="w-full">
              Masuk
            </Button> */}

            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
            </p>
          </form>
        </div>
      </MobileContainer>
    </>
  );
};

export default Login;
