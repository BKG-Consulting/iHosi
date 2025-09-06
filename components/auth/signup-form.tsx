'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Lock, Mail, User, Phone, MapPin, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SignupFormProps {
  onSuccess?: (user: any) => void;
  redirectTo?: string;
}

export function SignupForm({ onSuccess, redirectTo = '/patient/registration' }: SignupFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'PATIENT'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const router = useRouter();

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password.length < 12) {
      setError('Password must be at least 12 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain uppercase, lowercase, number, and special character');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (data.emailSent) {
          toast.success('Account created! Please check your email to verify your account.');
          router.push('/verify-email?email=' + encodeURIComponent(formData.email));
        } else {
          toast.success('Account created successfully!');
          onSuccess?.(data.user);
          router.push(redirectTo);
        }
      } else {
        setError(data.error || 'Registration failed');
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength(formData.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#5AC5C8] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#046658] to-[#2EB6B0] rounded-2xl mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#046658] mb-2">Ihosi</h1>
          <p className="text-[#3E4C4B] text-sm">Healthcare Management System</p>
        </div>

        <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white p-8">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-white/90 text-center">
              Join Ihosi Healthcare Management System
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-semibold text-[#3E4C4B]">
                        First Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] w-5 h-5" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Enter your first name"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="pl-10 h-12 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0] focus:ring-2 focus:ring-[#2EB6B0]/20 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-semibold text-[#3E4C4B]">
                        Last Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] w-5 h-5" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Enter your last name"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="pl-10 h-12 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0] focus:ring-2 focus:ring-[#2EB6B0]/20 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-[#3E4C4B]">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] w-5 h-5" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10 h-12 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0] focus:ring-2 focus:ring-[#2EB6B0]/20 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-[#3E4C4B]">
                      Phone Number *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] w-5 h-5" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-10 h-12 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0] focus:ring-2 focus:ring-[#2EB6B0]/20 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full h-12 bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    Continue to Security
                  </Button>
                </div>
              )}

              {/* Step 2: Security */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-[#3E4C4B]">
                      Password *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] w-5 h-5" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 pr-10 h-12 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0] focus:ring-2 focus:ring-[#2EB6B0]/20 transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] hover:text-[#2EB6B0] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="space-y-2">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 flex-1 rounded-full ${
                                i < strength ? strengthColors[strength - 1] : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-[#3E4C4B]">
                          Password strength: {strengthLabels[strength - 1] || 'Very Weak'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#3E4C4B]">
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] w-5 h-5" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-10 pr-10 h-12 border-2 border-[#D1F1F2] rounded-xl focus:border-[#2EB6B0] focus:ring-2 focus:ring-[#2EB6B0]/20 transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5AC5C8] hover:text-[#2EB6B0] transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Passwords match</span>
                      </div>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="p-4 bg-[#D1F1F2] rounded-xl">
                    <h4 className="text-sm font-semibold text-[#046658] mb-2">Password Requirements:</h4>
                    <ul className="text-xs text-[#3E4C4B] space-y-1">
                      <li>• At least 12 characters long</li>
                      <li>• Contains uppercase and lowercase letters</li>
                      <li>• Contains numbers and special characters</li>
                      <li>• Not easily guessable</li>
                    </ul>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2] rounded-xl"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || strength < 4 || formData.password !== formData.confirmPassword}
                      className="flex-1 h-12 bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#3E4C4B]">
                Already have an account?{' '}
                <button className="text-[#2EB6B0] hover:text-[#046658] font-medium transition-colors">
                  Sign in here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-[#D1F1F2]">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-[#2EB6B0] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lock className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#046658] mb-1">Secure Registration</p>
              <p className="text-xs text-[#3E4C4B]">
                Your account will be protected by enterprise-grade security measures including multi-factor authentication and encrypted data storage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
