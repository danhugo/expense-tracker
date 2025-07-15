
import { useState, useEffect } from 'react';

declare const google: typeof window.google;
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8060/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);

      // Fetch user data after successful login
      const userRes = await fetch('http://localhost:8060/users/me', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      } else {
        console.error('Failed to fetch user data');
      }
      navigate('/');
    } catch (error: unknown) {
      console.error('Login error:', (error as Error).message);
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (response: unknown) => {
    setIsGoogleLoading(true);
    try {
      console.log('Google Auth Response:', response);
      const res = await fetch('http://127.0.0.1:8060/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token_str: response.credential }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Backend Error Data:', errorData);
        throw new Error(errorData.detail || 'Google login failed');
      }

      const data = await res.json();
      console.log('Backend Response Data:', data);
      localStorage.setItem('token', data.access_token);
      // Fetch user data after successful login
      const userRes = await fetch('http://localhost:8060/users/me', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      } else {
        console.error('Failed to fetch user data');
      }
      navigate('/');
    } catch (error: unknown) {
      console.error('Google login error:', (error as Error).message);
      setErrorMessage((error as Error).message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin,
      ux_mode: 'popup',
    });
    google.accounts.id.renderButton(
      document.getElementById('google-sign-in-button'),
      { theme: 'outline', size: 'large', width: '100%' }
    );
  }, [handleGoogleLogin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-green/10 to-accent-yellow/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your Personal Expense Manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4">
              <div className="flex items-center justify-between bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{errorMessage}</span>
                <button
                  type="button"
                  className="ml-2 text-red-700 hover:text-red-900"
                  onClick={() => setErrorMessage('')}
                  aria-label="Dismiss"
                >
                  &times;
                </button>
              </div>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary-green hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <Separator className="my-4" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-2 text-sm text-gray-500">OR</span>
              </div>
            </div>

            {/* Google Sign In Button Wrapper */}
            <div className="w-full mt-4 relative">
              {/* Overlay to disable button while loading */}
              {isGoogleLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded">
                  <span className="text-primary-green font-semibold">Signing in...</span>
                </div>
              )}
              <div
                id="google-sign-in-button"
                className={`w-full ${isGoogleLoading ? 'pointer-events-none opacity-60' : ''}`}
              ></div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary-green font-medium hover:text-green-700 transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Forgot your password?
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
