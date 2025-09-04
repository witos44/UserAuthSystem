import { EmailVerificationForm } from "@/components/auth/EmailVerificationForm";

export default function VerifyEmail() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4" data-testid="page-verify-email">
      <EmailVerificationForm />
    </div>
  );
}
