import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MFASetupComponent } from "@/components/mfa-setup";

export default async function SetupMFAPage({
  searchParams
}: {
  searchParams: Promise<{ required?: string; expired?: string }>
}) {
  const { userId, sessionClaims } = await auth();
  const params = await searchParams;

  if (!userId) {
    redirect("/sign-in");
  }

  const userRole = sessionClaims?.metadata?.role || 'patient';
  
  // Simple MFA check without external dependencies
  const isRequired = params.required === 'true' || userRole === 'ADMIN';
  const isExpired = params.expired === 'true';

  // Mock MFA check result
  const mfaCheck = {
    required: isRequired,
    enforced: userRole === 'ADMIN',
    hasValidMFA: false, // Assume no MFA for setup page
    methods: ['sms', 'totp', 'backup_code']
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isRequired ? "Multi-Factor Authentication Required" : "Secure Your Account"}
          </h1>
          
          <div className="space-y-2">
            {isExpired && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-800 font-medium">
                    Your MFA setup grace period has expired. You must configure MFA to continue.
                  </span>
                </div>
              </div>
            )}

            {isRequired && !isExpired && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-800 font-medium">
                    Multi-factor authentication is required for your role ({userRole}) to access patient health information.
                  </span>
                </div>
              </div>
            )}

            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {isRequired 
                ? "HIPAA compliance requires additional security for healthcare staff accessing patient data. Please configure multi-factor authentication to continue."
                : "Add an extra layer of security to protect patient health information and comply with HIPAA requirements."
              }
            </p>
          </div>
        </div>

        {/* MFA Setup Component */}
        <MFASetupComponent 
          userId={userId}
          userRole={userRole}
          isRequired={isRequired}
          mfaRequirement={mfaCheck}
        />

        {/* HIPAA Information */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Why is MFA Required?
          </h3>
          <div className="text-blue-800 space-y-2">
            <p className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span><strong>HIPAA Compliance:</strong> Healthcare organizations must implement appropriate safeguards to protect electronic health information.</span>
            </p>
            <p className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span><strong>Data Protection:</strong> Patient health information is highly sensitive and requires enhanced security measures.</span>
            </p>
            <p className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span><strong>Access Control:</strong> MFA ensures that only authorized personnel can access patient records and medical data.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
