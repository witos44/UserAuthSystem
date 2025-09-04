import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Zap, Code, CheckCircle, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background" data-testid="page-landing">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">AuthKit</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" data-testid="button-login">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button data-testid="button-register">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="mb-4" data-testid="badge-hero">
              Production Ready
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground" data-testid="text-hero-title">
              Complete User Management
              <span className="block text-primary">Made Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-description">
              A plug-and-play authentication system with conventional and social login,
              built with React, TypeScript, and modern security practices.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8" data-testid="button-hero-signup">
                Create Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-hero-login">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-features-title">
            Everything you need for authentication
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="text-features-description">
            Comprehensive features that scale with your application
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card data-testid="card-feature-auth">
            <CardHeader>
              <Shield className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Secure Authentication</CardTitle>
              <CardDescription>
                JWT tokens, password hashing, and session management with industry-standard security
              </CardDescription>
            </CardHeader>
          </Card>

          <Card data-testid="card-feature-social">
            <CardHeader>
              <Users className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Social Login</CardTitle>
              <CardDescription>
                Google and GitHub OAuth integration for seamless user onboarding
              </CardDescription>
            </CardHeader>
          </Card>

          <Card data-testid="card-feature-quick">
            <CardHeader>
              <Zap className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Quick Setup</CardTitle>
              <CardDescription>
                Plug-and-play architecture that integrates into any React application
              </CardDescription>
            </CardHeader>
          </Card>

          <Card data-testid="card-feature-typescript">
            <CardHeader>
              <Code className="w-8 h-8 text-primary mb-2" />
              <CardTitle>TypeScript First</CardTitle>
              <CardDescription>
                Full type safety across frontend and backend with shared schemas
              </CardDescription>
            </CardHeader>
          </Card>

          <Card data-testid="card-feature-email">
            <CardHeader>
              <CheckCircle className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>
                Built-in email verification and password reset functionality
              </CardDescription>
            </CardHeader>
          </Card>

          <Card data-testid="card-feature-profile">
            <CardHeader>
              <Users className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Profile Management</CardTitle>
              <CardDescription>
                Complete user profile system with avatar uploads and settings
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="container max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-tech-title">
            Built with modern technologies
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="text-tech-description">
            Production-ready stack that developers love
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-semibold mb-6 text-foreground" data-testid="text-frontend-title">
              Frontend
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center" data-testid="item-react">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                React with TypeScript
              </li>
              <li className="flex items-center" data-testid="item-tailwind">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                Tailwind CSS + shadcn/ui
              </li>
              <li className="flex items-center" data-testid="item-forms">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                React Hook Form validation
              </li>
              <li className="flex items-center" data-testid="item-query">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                TanStack Query for state management
              </li>
              <li className="flex items-center" data-testid="item-routing">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                Wouter for routing
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6 text-foreground" data-testid="text-backend-title">
              Backend
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center" data-testid="item-express">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                Express.js with TypeScript
              </li>
              <li className="flex items-center" data-testid="item-postgresql">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                PostgreSQL with Drizzle ORM
              </li>
              <li className="flex items-center" data-testid="item-passport">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                Passport.js for OAuth
              </li>
              <li className="flex items-center" data-testid="item-jwt">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                JWT authentication
              </li>
              <li className="flex items-center" data-testid="item-validation">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                Zod schema validation
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container max-w-6xl mx-auto px-4 py-20">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" data-testid="text-cta-title">
              Ready to get started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8" data-testid="text-cta-description">
              Create your account and experience the complete authentication system
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8" data-testid="button-cta-signup">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-cta-login">
                  Sign in
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Shield className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-medium text-foreground">AuthKit</span>
            </div>
            <p className="text-sm text-muted-foreground" data-testid="text-footer">
              © 2024 AuthKit. A complete authentication solution.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
