'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function TestAuthPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#5AC5C8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#2EB6B0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#3E4C4B]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#5AC5C8] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-[#046658]">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              You need to be logged in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => router.push('/sign-in')}
              className="w-full bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a]"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#5AC5C8] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] text-white">
            <CardTitle className="text-2xl font-bold text-center">Authentication Test</CardTitle>
            <CardDescription className="text-white/90 text-center">
              Custom authentication system is working correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl">
                  <h3 className="text-lg font-semibold text-[#046658] mb-2">User Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">ID:</span> {user.id}</p>
                    <p><span className="font-medium">Name:</span> {user.firstName} {user.lastName}</p>
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                    <p><span className="font-medium">Role:</span> {user.role}</p>
                    <p><span className="font-medium">MFA Enabled:</span> {user.mfaEnabled ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Active:</span> {user.isActive ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-[#D1F1F2] to-[#F5F7FA] rounded-xl">
                  <h3 className="text-lg font-semibold text-[#046658] mb-2">System Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Authentication: Working</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Session Management: Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Role-Based Access: Enabled</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Security Headers: Applied</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a]"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={logout}
                  variant="outline"
                  className="flex-1 border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]"
                >
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
