'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  RefreshCw, 
  ExternalLink,
  Shield,
  Clock
} from 'lucide-react';
import { AuthErrorHandler } from '@/lib/auth/auth-error-handler';

interface AuthErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function AuthErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  showDetails = false,
  className = '' 
}: AuthErrorDisplayProps) {
  if (!error) return null;

  const authError = AuthErrorHandler.parseError(error);
  const isRetryable = AuthErrorHandler.isRetryable(error);
  const severity = AuthErrorHandler.getSeverity(error);
  const suggestedAction = AuthErrorHandler.getSuggestedAction(error);
  const requiresAttention = AuthErrorHandler.requiresImmediateAttention(error);

  const getSeverityIcon = () => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'high':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getSeverityBadgeColor = () => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Alert className={`${getSeverityColor()} ${className}`}>
      <div className="flex items-start gap-3">
        {getSeverityIcon()}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">
                {severity === 'critical' && 'Critical Error'}
                {severity === 'high' && 'High Priority Issue'}
                {severity === 'medium' && 'Authentication Error'}
                {severity === 'low' && 'Notice'}
              </h4>
              <Badge variant="outline" className={getSeverityBadgeColor()}>
                {severity.toUpperCase()}
              </Badge>
            </div>
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0 hover:bg-transparent"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <AlertDescription className="text-sm">
            {authError.userMessage}
          </AlertDescription>

          {suggestedAction && (
            <div className="flex items-start gap-2 mt-2">
              <Shield className="h-4 w-4 mt-0.5 text-blue-600" />
              <p className="text-sm font-medium">
                Suggested Action: {suggestedAction}
              </p>
            </div>
          )}

          {showDetails && (
            <div className="mt-3 p-3 bg-white/50 rounded-md border border-gray-200">
              <details className="space-y-2">
                <summary className="cursor-pointer text-sm font-medium hover:text-gray-700">
                  Technical Details
                </summary>
                <div className="space-y-1 text-xs text-gray-600">
                  <p><strong>Error Code:</strong> {authError.code}</p>
                  <p><strong>Message:</strong> {authError.message}</p>
                  <p><strong>Retryable:</strong> {isRetryable ? 'Yes' : 'No'}</p>
                  {requiresAttention && (
                    <p className="text-red-600 font-medium">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Requires immediate attention
                    </p>
                  )}
                </div>
              </details>
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            {isRetryable && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Again
              </Button>
            )}
            
            {severity === 'critical' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('mailto:support@healthcare.com', '_blank')}
                className="h-8"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Contact Support
              </Button>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
}

// Helper component for inline error display
export function InlineAuthError({ error, className = '' }: { error: any; className?: string }) {
  if (!error) return null;

  const authError = AuthErrorHandler.parseError(error);
  const severity = AuthErrorHandler.getSeverity(error);

  const getSeverityColor = () => {
    switch (severity) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <p className={`text-sm ${getSeverityColor()} ${className}`}>
      {authError.userMessage}
    </p>
  );
}

