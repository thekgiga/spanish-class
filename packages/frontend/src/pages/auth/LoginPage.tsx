import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Sparkles, Mail, Lock } from 'lucide-react';
import { loginSchema, type LoginInput } from '@spanish-class/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-spanish-cream-50 via-white to-gold-50">
      {/* Decorative elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-spanish-red-100/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-gold-100/30 to-transparent rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <Card variant="elevated" className="border-2 border-spanish-cream-200 shadow-large">
          <CardHeader className="text-center pb-2">
            <Link to="/" className="inline-flex items-center justify-center gap-3 mb-6 group">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-spanish-red-500 to-spanish-red-600 flex items-center justify-center shadow-glow-red group-hover:shadow-lg transition-shadow">
                <span className="text-white font-display text-2xl font-bold">S</span>
              </div>
            </Link>
            <CardTitle className="text-3xl font-display">Welcome back</CardTitle>
            <CardDescription className="text-navy-500 mt-2">
              Sign in to continue your Spanish journey
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-navy-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail className="h-5 w-5" />}
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-navy-700 font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    icon={<Lock className="h-5 w-5" />}
                    className="pr-12"
                    {...register('password')}
                    error={errors.password?.message}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-navy-400 hover:text-navy-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full shadow-glow-red"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Sign in
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-spanish-cream-200">
              <p className="text-center text-sm text-navy-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-spanish-red-600 hover:text-spanish-red-700 transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Decorative badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -top-4 -right-4 bg-gradient-to-br from-gold-400 to-gold-500 text-navy-900 px-4 py-2 rounded-xl shadow-lg font-semibold text-sm flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Free to join
        </motion.div>
      </motion.div>
    </div>
  );
}
