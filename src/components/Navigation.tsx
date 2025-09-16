import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, FileText, Crown, CreditCard } from 'lucide-react';
import { SubscriptionBadge } from '@/components/SubscriptionBadge';
import { useSubscription } from '@/hooks/useSubscription';
import { subscriptionService } from '@/lib/subscriptionService';
import { useToast } from '@/hooks/use-toast';

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const { isPro } = useSubscription();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleManageBilling = async () => {
    try {
      const portalUrl = await subscriptionService.createPortalSession();
      window.open(portalUrl, '_blank');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to open billing portal. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].charAt(0).toUpperCase();
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold">
              Ansible EE Builder
            </Link>
            
            {user && (
              <div className="flex items-center gap-1">
                <Link
                  to="/"
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === '/' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  Builder
                </Link>
                <Link
                  to="/templates"
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === '/templates' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  My Templates
                </Link>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user && <SubscriptionBadge />}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/templates')}>
                    <FileText className="mr-2 h-4 w-4" />
                    My Templates
                  </DropdownMenuItem>
                  {isPro && (
                    <DropdownMenuItem onClick={handleManageBilling}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Billing
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/auth')} variant="outline">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};