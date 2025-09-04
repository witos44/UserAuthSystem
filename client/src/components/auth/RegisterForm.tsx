import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserSchema, type RegisterUser } from "@shared/schema";
import { useRegister } from "@/hooks/useAuth";
import { validatePassword } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { Eye, EyeOff } from "lucide-react";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong">("weak");
  const [passwordProgress, setPasswordProgress] = useState(0);
  const { toast } = useToast();
  const register = useRegister();

  const form = useForm<RegisterUser>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const watchedPassword = form.watch("password");

  useEffect(() => {
    if (watchedPassword) {
      const validation = validatePassword(watchedPassword);
      setPasswordStrength(validation.strength);
      
      const strengthMap = { weak: 25, medium: 60, strong: 100 };
      setPasswordProgress(strengthMap[validation.strength]);
    } else {
      setPasswordProgress(0);
    }
  }, [watchedPassword]);

  const onSubmit = async (data: RegisterUser) => {
    try {
      await register.mutateAsync(data);
      toast({
        title: "Success",
        description: "Account created successfully. Please check your email for verification.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    }
  };

  const getStrengthColor = (strength: "weak" | "medium" | "strong") => {
    switch (strength) {
      case "weak": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "strong": return "bg-green-500";
    }
  };

  const getStrengthText = (strength: "weak" | "medium" | "strong") => {
    switch (strength) {
      case "weak": return "Weak";
      case "medium": return "Medium";
      case "strong": return "Strong";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="card-register">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create account</CardTitle>
        <CardDescription>Get started with your free account</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <SocialAuthButtons type="register" disabled={register.isPending} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border"></span>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...form.register("firstName")}
                data-testid="input-firstName"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive" data-testid="text-firstName-error">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...form.register("lastName")}
                data-testid="input-lastName"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive" data-testid="text-lastName-error">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...form.register("password")}
                data-testid="input-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-toggle-password"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            {watchedPassword && (
              <div className="space-y-2">
                <Progress 
                  value={passwordProgress} 
                  className="h-1" 
                  data-testid="progress-password-strength"
                />
                <p className="text-xs text-muted-foreground" data-testid="text-password-strength">
                  Password strength: {getStrengthText(passwordStrength)}
                </p>
              </div>
            )}

            {form.formState.errors.password && (
              <p className="text-sm text-destructive" data-testid="text-password-error">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                {...form.register("confirmPassword")}
                data-testid="input-confirmPassword"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                data-testid="button-toggle-confirmPassword"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive" data-testid="text-confirmPassword-error">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="terms" required data-testid="checkbox-terms" />
            <Label htmlFor="terms" className="text-sm leading-5">
              I agree to the{" "}
              <Button variant="link" className="p-0 h-auto text-sm" data-testid="link-terms">
                Terms of Service
              </Button>{" "}
              and{" "}
              <Button variant="link" className="p-0 h-auto text-sm" data-testid="link-privacy">
                Privacy Policy
              </Button>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={register.isPending}
            data-testid="button-register"
          >
            {register.isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login">
              <Button variant="link" className="p-0 h-auto" data-testid="link-login">
                Sign in
              </Button>
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
