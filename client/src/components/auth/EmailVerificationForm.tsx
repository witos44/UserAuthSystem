import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useVerifyEmail, useResendVerification, useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Check, AlertCircle } from "lucide-react";

export function EmailVerificationForm() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/verify-email/:token");
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();

  const token = params?.token;

  useEffect(() => {
    if (token && match) {
      verifyEmail.mutate(token, {
        onSuccess: () => {
          setIsVerified(true);
          toast({
            title: "Success",
            description: "Your email has been verified successfully!",
          });
          setTimeout(() => {
            setLocation("/");
          }, 3000);
        },
        onError: (error: any) => {
          toast({
            title: "Error", 
            description: error.message || "Invalid or expired verification token",
            variant: "destructive",
          });
        },
      });
    }
  }, [token, match, verifyEmail, toast, setLocation]);

  const handleResendVerification = async () => {
    try {
      await resendVerification.mutateAsync();
      toast({
        title: "Success",
        description: "Verification email sent successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    }
  };

  if (isVerified) {
    return (
      <Card className="w-full max-w-md mx-auto" data-testid="card-verification-success">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-verified-title">
              Email verified!
            </h3>
            <p className="text-muted-foreground mb-6" data-testid="text-verified-description">
              Your email address has been successfully verified. You can now access all features.
            </p>
            <Button onClick={() => setLocation("/")} data-testid="button-continue">
              Continue to dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="card-email-verification">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
        <CardDescription>
          {user?.email ? (
            <>
              We've sent a verification link to{" "}
              <span className="font-medium text-foreground" data-testid="text-user-email">
                {user.email}
              </span>
            </>
          ) : (
            "Check your email for a verification link"
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="bg-muted/50 border border-border rounded-md p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground mb-1">Next steps:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside ml-2">
                <li>Check your email inbox</li>
                <li>Click the verification link</li>
                <li>Return to complete your registration</li>
              </ol>
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          variant="secondary"
          onClick={handleResendVerification}
          disabled={resendVerification.isPending}
          data-testid="button-resend-verification"
        >
          {resendVerification.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Resend verification email
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Wrong email address?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm" 
              onClick={() => setLocation("/profile")}
              data-testid="link-change-email"
            >
              Change email
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
