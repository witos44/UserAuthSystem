import { Link } from "wouter";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { getFullName } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Settings, Shield, LogOut } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const logout = useLogout();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background" data-testid="page-home">
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
              <Link href="/profile">
                <Button variant="ghost" size="sm" data-testid="link-profile">
                  <Settings className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                disabled={logout.isPending}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logout.isPending ? "Signing out..." : "Sign out"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground" data-testid="text-welcome-title">
              Welcome back, {getFullName(user.firstName, user.lastName)}!
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="text-welcome-description">
              You're successfully authenticated and can access all features.
            </p>
          </div>

          {/* User Card */}
          <Card className="max-w-md mx-auto" data-testid="card-user-info">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-20 h-20" data-testid="avatar-user">
                  <AvatarImage src={user.profileImageUrl} alt="Profile picture" />
                  <AvatarFallback className="text-lg">
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle data-testid="text-user-name">
                {getFullName(user.firstName, user.lastName)}
              </CardTitle>
              <CardDescription data-testid="text-user-email">
                {user.email}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex justify-center">
                {user.emailVerified ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" data-testid="badge-verified">
                    <Shield className="w-3 h-3 mr-1" />
                    Email Verified
                  </Badge>
                ) : (
                  <div className="space-y-2 text-center">
                    <Badge variant="destructive" data-testid="badge-unverified">
                      Email Not Verified
                    </Badge>
                    <Link href="/verify-email">
                      <Button variant="link" size="sm" data-testid="link-verify-email">
                        Verify now
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Connected Accounts</h4>
                <div className="flex justify-center space-x-2">
                  {user.hasGoogleAuth && (
                    <Badge variant="outline" data-testid="badge-google">
                      Google
                    </Badge>
                  )}
                  {user.hasGithubAuth && (
                    <Badge variant="outline" data-testid="badge-github">
                      GitHub
                    </Badge>
                  )}
                  {user.hasPassword && (
                    <Badge variant="outline" data-testid="badge-password">
                      Password
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card data-testid="card-profile-action">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Settings className="w-5 h-5 mr-2" />
                  Profile Settings
                </CardTitle>
                <CardDescription>
                  Update your personal information and security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/profile">
                  <Button className="w-full" data-testid="button-manage-profile">
                    Manage Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card data-testid="card-security-action">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Shield className="w-5 h-5 mr-2" />
                  Account Security
                </CardTitle>
                <CardDescription>
                  Review your login methods and security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/profile">
                  <Button variant="outline" className="w-full" data-testid="button-security-settings">
                    Security Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
