'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Reset token is missing. Please use the link from your email.');
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(password);
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        toast({
          title: "Success",
          description: "Your password has been reset successfully",
        });
      } else {
        setError(data.message);
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
              Password Reset Successful!
            </CardTitle>
            <CardDescription>
              Your password has been reset successfully. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Sign In with New Password
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900 rounded-full w-fit">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
              Invalid Reset Link
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/forgot-password">
                Request New Reset Link
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Back to Sign In
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
            <CardDescription>Create a new password for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-muted-foreground">Password requirements:</div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className={`flex items-center ${passwordRequirements.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        8+ characters
                      </div>
                      <div className={`flex items-center ${passwordRequirements.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Uppercase
                      </div>
                      <div className={`flex items-center ${passwordRequirements.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Lowercase
                      </div>
                      <div className={`flex items-center ${passwordRequirements.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Number
                      </div>
                      <div className={`flex items-center ${passwordRequirements.special ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Special character
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !isPasswordValid || password !== confirmPassword}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Resetting password...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Reset Password
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/auth/login" className="text-sm text-primary hover:underline flex items-center justify-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}