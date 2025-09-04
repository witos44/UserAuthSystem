import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPassword } from "@shared/schema";
import { useForgotPassword } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Key, Check } from "lucide-react";

export function PasswordResetForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { toast } = useToast();
  const forgotPassword = useForgotPassword();

  const form = useForm<ResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPassword) => {
    try {
      await forgotPassword.mutateAsync(data);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while sending reset email",
        variant: "destructive",
      });
    }
  };

  const handleTryAgain = () => {
    form.reset();
    forgotPassword.mutate({ email: submittedEmail });
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6" data-testid="container-reset-success">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2" data-testid="text-success-title">
                Check your email
              </h3>
              <p className="text-muted-foreground mb-4" data-testid="text-success-description">
                We've sent a password reset link to{" "}
                <span className="font-medium text-foreground">{submittedEmail}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm" 
                  onClick={handleTryAgain}
                  disabled={forgotPassword.isPending}
                  data-testid="button-try-again"
                >
                  try again
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="card-password-reset">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...form.register("email")}
              data-testid="input-email"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive" data-testid="text-email-error">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={forgotPassword.isPending}
            data-testid="button-send-reset"
          >
            {forgotPassword.isPending ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <div className="text-center">
          <Link href="/login">
            <Button variant="link" className="text-sm" data-testid="link-back-to-login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
