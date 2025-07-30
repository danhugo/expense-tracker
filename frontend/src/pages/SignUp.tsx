
import { useState, useEffect } from 'react';

declare const google: typeof window.google; // TODO: Find a more specific type for the google object
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Eye, EyeOff } from 'lucide-react';
import IntricateDiamond from '@/components/Diamond';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [googleError, setGoogleError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false);
      // For now, just navigate to dashboard
      navigate('/');
    }, 1000);
  };

  const handleGoogleSignUp = async (response: { credential?: string }) => {
    setIsGoogleLoading(true);
    setGoogleError('');
    try {
      console.log('Google Auth Response:', response);
      const res = await fetch('http://localhost:8060/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ id_token_str: response.credential || '' }).toString(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Backend Error Data:', errorData);
        setGoogleError(errorData.detail || 'Google signup failed');
        throw new Error(errorData.detail || 'Google signup failed');
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      // Fetch user data after successful signup
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
      console.error('Google signup error:', (error as Error).message);
      setGoogleError((error as Error).message || 'Google signup failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    // @ts-expect-error: Google's types are not available
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleSignUp,
      ux_mode: 'popup',
    });
    // @ts-expect-error: Google's types are not available
    google.accounts.id.renderButton(
      document.getElementById('google-sign-up-button'),
      { theme: 'outline', size: 'large', width: '100%' }
    );
  }, [handleGoogleSignUp]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-green/10 to-accent-yellow/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-full h-16 bg-primary-green rounded flex items-center justify-center mb-4">
            <IntricateDiamond className="mr-2" />

            <div className="text-2xl font-bold bg-yellow-400 bg-clip-text text-transparent">
                HUFI
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Join Us!</CardTitle>
          <CardDescription className="text-gray-600">
            Start managing your personal expenses today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error Alert for Google Signup */}
          {googleError && (
            <div className="mb-4">
              <div className="flex items-center justify-between bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{googleError}</span>
                <button
                  type="button"
                  className="ml-2 text-red-700 hover:text-red-900"
                  onClick={() => setGoogleError('')}
                  aria-label="Dismiss"
                >
                  &times;
                </button>
              </div>
            </div>
          )}
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`w-full ${errors.fullName ? 'border-red-500' : ''}`}
                required
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pr-10 ${errors.password ? 'border-red-500' : ''}`}
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
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-black hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <Separator className="my-4" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-2 text-sm text-gray-500">OR</span>
              </div>
            </div>

            {/* Google Sign Up Button Wrapper */}
            <div className="w-full mt-4 relative">
              {/* Overlay to disable button while loading */}
              {isGoogleLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded">
                  <span className="text-primary-green font-semibold">Signing up...</span>
                </div>
              )}
              <div
                id="google-sign-up-button"
                className={`w-full ${isGoogleLoading ? 'pointer-events-none opacity-60' : ''}`}
              ></div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-green font-medium hover:text-yellow-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
