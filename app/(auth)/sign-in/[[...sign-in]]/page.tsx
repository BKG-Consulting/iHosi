import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#3E4C4B] mb-2">Welcome Back</h1>
        <p className="text-[#3E4C4B]/70">Sign in to your Ihosi Healthcare account</p>
      </div>
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: "bg-[#046658] hover:bg-[#046658]/90 text-white",
            card: "shadow-none border-0",
            headerTitle: "text-[#3E4C4B] font-bold",
            headerSubtitle: "text-[#3E4C4B]/70",
            socialButtonsBlockButton: "border-[#D1F1F2] hover:bg-[#F5F7FA]",
            formFieldInput: "border-[#D1F1F2] focus:border-[#046658] focus:ring-[#046658]/20",
            footerActionLink: "text-[#046658] hover:text-[#046658]/80",
            identityPreviewText: "text-[#3E4C4B]",
            formFieldLabel: "text-[#3E4C4B] font-medium",
            formResendCodeLink: "text-[#046658] hover:text-[#046658]/80",
            otpCodeFieldInput: "border-[#D1F1F2] focus:border-[#046658] focus:ring-[#046658]/20",
            formFieldSuccessText: "text-[#046658]",
            formFieldErrorText: "text-red-600",
            alertText: "text-red-600",
            formFieldWarningText: "text-amber-600"
          }
        }}
      />
    </div>
  );
}
