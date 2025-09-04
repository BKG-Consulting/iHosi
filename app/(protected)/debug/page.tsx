import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DebugPage() {
  const { userId, sessionClaims } = await auth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Information</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current user authentication information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>User ID:</strong> {userId || 'Not authenticated'}
              </div>
              <div>
                <strong>Session Claims:</strong>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(sessionClaims, null, 2)}
                </pre>
              </div>
              <div>
                <strong>User Role:</strong> {sessionClaims?.metadata?.role || 'No role defined'}
              </div>
              <div>
                <strong>Role Type:</strong> {typeof sessionClaims?.metadata?.role}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Check Test</CardTitle>
            <CardDescription>Testing role-based access control</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Is Admin?</strong> {(sessionClaims?.metadata?.role as string) === 'admin' ? '✅ Yes' : '❌ No'}
              </div>
              <div>
                <strong>Is Doctor?</strong> {(sessionClaims?.metadata?.role as string) === 'doctor' ? '✅ Yes' : '❌ No'}
              </div>
              <div>
                <strong>Is Nurse?</strong> {(sessionClaims?.metadata?.role as string) === 'nurse' ? '✅ Yes' : '❌ No'}
              </div>
              <div>
                <strong>Is Patient?</strong> {(sessionClaims?.metadata?.role as string) === 'patient' ? '✅ Yes' : '❌ No'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
