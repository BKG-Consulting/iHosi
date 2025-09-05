"use client";

import { CheckCircle, ArrowRight, Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SuccessTransitionProps {
  title: string;
  message: string;
  redirectTo: string;
  redirectDelay?: number;
}

export const SuccessTransition = ({ 
  title, 
  message, 
  redirectTo, 
  redirectDelay = 3000 
}: SuccessTransitionProps) => {
  const [countdown, setCountdown] = useState(redirectDelay / 1000);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRedirecting(true);
          setTimeout(() => {
            router.push(redirectTo);
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redirectTo, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#D1F1F2] to-[#F5F7FA] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#046658] to-[#2EB6B0] rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#2EB6B0] to-[#5AC5C8] rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-12 h-12 mr-3">
              <Image
                src="/logo.png"
                alt="Ihosi Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-[#3E4C4B]">Ihosi</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-[#3E4C4B] mb-4">
            {title}
          </h2>
          <p className="text-lg text-[#3E4C4B]/80 mb-6">
            {message}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-[#D1F1F2] rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${((redirectDelay - countdown * 1000) / redirectDelay) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-[#3E4C4B]/60">
            <span>Redirecting...</span>
            <span>{countdown}s</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.push(redirectTo)}
            disabled={isRedirecting}
            className="w-full bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#046658]/90 hover:to-[#2EB6B0]/90 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isRedirecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <span>Continue to Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full border-2 border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#F5F7FA] hover:border-[#046658] font-medium py-3 px-6 rounded-xl transition-all duration-300"
          >
            Stay on this page
          </button>
        </div>

        {/* Features Preview */}
        <div className="mt-8 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-[#D1F1F2]">
          <h3 className="text-lg font-semibold text-[#3E4C4B] mb-4 text-center">
            What's Next?
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-[#046658] to-[#2EB6B0] rounded-full" />
              <span className="text-sm text-[#3E4C4B]/80">Access your personalized dashboard</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-[#046658] to-[#2EB6B0] rounded-full" />
              <span className="text-sm text-[#3E4C4B]/80">Schedule appointments with doctors</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-[#046658] to-[#2EB6B0] rounded-full" />
              <span className="text-sm text-[#3E4C4B]/80">View your medical records securely</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gradient-to-r from-[#046658] to-[#2EB6B0] rounded-full" />
              <span className="text-sm text-[#3E4C4B]/80">Manage your healthcare journey</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
