'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Smartphone, 
  Key, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

interface SecurityStatusProps {
  readonly userId: string;
  readonly onMFASetup?: () => void;
}

interface SecurityInfo {
  mfaEnabled: boolean;
  lastLogin: string | null;
  passwordAge: number;
  sessionActive: boolean;
  securityScore: number;
  recommendations: string[];
}

export function SecurityStatus({ userId, onMFASetup }: SecurityStatusProps) {
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchSecurityStatus();
  }, [userId]);

  const fetchSecurityStatus = async () => {
    try {
      const response = await fetch(`/api/auth/security-status?userId=${userId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSecurityInfo(data);
      } else {
        setError('Failed to load security status');
      }
    } catch (error) {
      console.error('Security status error:', error);
      setError('Network error loading security status');
    } finally {
      setLoading(false);
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSecurityScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const formatPasswordAge = (ageInDays: number) => {
    if (ageInDays < 30) return `${ageInDays} days`;
    if (ageInDays < 365) return `${Math.floor(ageInDays / 30)} months`;
    return `${Math.floor(ageInDays / 365)} years`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            <span>Loading security status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !securityInfo) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>{error || 'Failed to load security status'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Security Score Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Security Status</CardTitle>
            </div>
            <Badge className={getSecurityScoreBadge(securityInfo.securityScore)}>
              Score: {securityInfo.securityScore}/100
            </Badge>
          </div>
          <CardDescription>
            Your account security overview and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Security Score Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Security Score</span>
                <span className={getSecurityScoreColor(securityInfo.securityScore)}>
                  {securityInfo.securityScore}/100
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    securityInfo.securityScore >= 80 ? 'bg-green-500' :
                    securityInfo.securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${securityInfo.securityScore}%` }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
              {!securityInfo.mfaEnabled && onMFASetup && (
                <Button
                  size="sm"
                  onClick={onMFASetup}
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  Enable MFA
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Security Info */}
      {showDetails && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* MFA Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={securityInfo.mfaEnabled ? "default" : "destructive"}>
                  {securityInfo.mfaEnabled ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Disabled
                    </>
                  )}
                </Badge>
              </div>
              {!securityInfo.mfaEnabled && (
                <p className="text-xs text-muted-foreground mt-2">
                  Add an extra layer of security to your account
                </p>
              )}
            </CardContent>
          </Card>

          {/* Session Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Session Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Session</span>
                  <Badge variant={securityInfo.sessionActive ? "default" : "secondary"}>
                    {securityInfo.sessionActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Login</span>
                  <span className="text-xs text-muted-foreground">
                    {formatLastLogin(securityInfo.lastLogin)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Security */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-4 h-4" />
                Password Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Password Age</span>
                  <span className="text-xs text-muted-foreground">
                    {formatPasswordAge(securityInfo.passwordAge)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recommendation</span>
                  <Badge variant={securityInfo.passwordAge > 90 ? "destructive" : "default"}>
                    {securityInfo.passwordAge > 90 ? 'Update Soon' : 'Good'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Recommendations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {securityInfo.recommendations.length > 0 ? (
                  securityInfo.recommendations.map((recommendation, index) => (
                    <div key={`recommendation-${index}`} className="flex items-start gap-2 text-xs">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{recommendation}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Your account security looks good!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
