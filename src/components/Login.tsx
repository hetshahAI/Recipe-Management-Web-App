import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(userData.user ?? null);
      } catch (e) {
        console.error('getUser error', e);
      }
    };

    fetchUser();

    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
      else setUser(null);
    });

    return () => {
      mounted = false;
      try { (sub as any)?.data?.subscription?.unsubscribe?.(); } catch (e) { /* noop */ }
    };
  }, []);

  const handleSignUp = async () => {
    if (!email || !password) {
      toast({ title: 'Error', description: 'Email and password are required', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Check your email for confirmation link.' });
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({ title: 'Error', description: 'Email and password are required', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (userId) {
        await seedDefaultRecipes(userId);
      }
    } catch (e) {
      console.error('post sign-in seeding error', e);
    }

    toast({ title: 'Signed in', description: 'Welcome!' });
    navigate('/recipes', { replace: true });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast({ title: 'Signed out' });
  };

  const seedDefaultRecipes = async (userId: string) => {
    try {
      const client: any = (supabase as any);
      const userQuery: any = client.from('recipes').select('id').eq('user_id', userId).limit(1);
      const { data: userHas, error: checkErr } = await userQuery;
      if (checkErr) {
        console.error('Error checking user recipes for seeding', checkErr);
        return;
      }
      if (userHas && userHas.length > 0) return;

      const publicQuery: any = client
        .from('recipes')
        .select('*')
        .is('user_id', null)
        .order('created_at', { ascending: true })
        .limit(3);
      const { data: publicRows, error: publicErr } = await publicQuery;
      if (publicErr) {
        console.error('Failed to read public recipes for seeding:', publicErr);
        return;
      }
      if (!publicRows || publicRows.length === 0) return;
      const copies = publicRows.map((r: any) => {
        const { id, created_at, updated_at, user_id, ...rest } = r;
        return { ...rest, user_id: userId };
      });
      const insertQuery: any = client.from('recipes').insert(copies);
      const { error: insertErr } = await insertQuery;
      if (insertErr) console.error('Failed to seed default recipes:', insertErr);
      else toast({ title: 'Welcome', description: 'Default recipes added to your account.' });
    } catch (e) {
      console.error('seedDefaultRecipes error', e);
    }
  };

  if (user) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-center">Signed in as <strong>{user.email}</strong></p>
        <Button onClick={handleSignOut} variant="outline" className="w-full">Sign out</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={handleSignIn} disabled={loading} className="flex-1">Sign in</Button>
        <Button onClick={handleSignUp} variant="secondary" disabled={loading} className="flex-1">Sign up</Button>
      </div>
    </div>
  );
};

export default Login;
