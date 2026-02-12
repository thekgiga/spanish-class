import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Sparkles, Mail, Lock, User, GraduationCap, CheckCircle2 } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@spanish-class/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth';

const benefits = [
  'Access to live Spanish classes',
  'Native-speaking instructors',
  'Flexible scheduling',
];

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerUser(data);
      toast.success('¡Bienvenido! Welcome to Spanish Class!');
      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Failed to create account');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-spanish-cream-50 via-white to-gold-50">
      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-spanish-red-100/30 to-transparent rounded-full -translate-y-1/2 -translate-x-1/3 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-gold-100/30 to-transparent rounded-full translate-y-1/3 translate-x-1/3 pointer-events-none" />

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
            <CardTitle className="text-3xl font-display">Create your account</CardTitle>
            <CardDescription className="text-navy-500 mt-2">
              Start your Spanish learning journey today
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Benefits list */}
            <div className="mb-6 p-4 rounded-xl bg-spanish-cream-50 border border-spanish-cream-200">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-gold-500" />
                <span className="font-semibold text-navy-700">What you'll get:</span>
              </div>
              <ul className="space-y-2">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-sm text-navy-600">
                    <CheckCircle2 className="h-4 w-4 text-spanish-olive-500 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-navy-700 font-medium">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    icon={<User className="h-5 w-5" />}
                    {...register('firstName')}
                    error={errors.firstName?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-navy-700 font-medium">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...register('lastName')}
                    error={errors.lastName?.message}
                  />
                </div>
              </div>

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
                    placeholder="At least 8 characters"
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
                <p className="text-xs text-navy-400 mt-1">
                  Must contain uppercase, lowercase, and number
                </p>
              </div>

              <Button
                type="submit"
                className="w-full shadow-glow-red"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Create account
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-spanish-cream-200">
              <p className="text-center text-sm text-navy-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-spanish-red-600 hover:text-spanish-red-700 transition-colors">
                  Sign in
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
          className="absolute -top-4 -left-4 bg-gradient-to-br from-spanish-olive-400 to-spanish-olive-500 text-white px-4 py-2 rounded-xl shadow-lg font-semibold text-sm flex items-center gap-2"
        >
          <GraduationCap className="h-4 w-4" />
          500+ students
        </motion.div>
      </motion.div>
    </div>
  );
}
