"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, AlertTriangle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        <Card className="border-0 shadow-2xl bg-white">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Access Denied
            </CardTitle>
            <CardDescription className="text-gray-600">
              You don't have permission to access this resource
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Insufficient Permissions</span>
              </div>
              <p className="text-sm text-gray-600">
                Your current role doesn't have the required permissions to access this page. 
                Please contact your administrator if you believe this is an error.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-600" />
                What you can do:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Return to your dashboard</li>
                <li>• Contact your system administrator</li>
                <li>• Request permission elevation</li>
                <li>• Check your current role and permissions</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <Link href="/">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                If you continue to experience issues, please contact support
              </p>
              <Link href="mailto:support@healthcarepro.com" className="text-xs text-blue-600 hover:underline">
                support@healthcarepro.com
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
