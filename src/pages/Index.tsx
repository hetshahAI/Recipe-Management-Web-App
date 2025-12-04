import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Login from '@/components/Login';
import ThemeToggle from '@/components/ThemeToggle';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/recipes', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-4 text-3xl font-bold">Smart Recipe Box</h1>
            <p className="text-sm text-muted-foreground">Sign in or create an account to manage your recipes.</p>
          </div>
          <div>
            <ThemeToggle />
          </div>
        </div>
        <div className="p-4 bg-card rounded-md">
          <Login />
        </div>
      </div>
    </div>
  );
};

export default Index;
