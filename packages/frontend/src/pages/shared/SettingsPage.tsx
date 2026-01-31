import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { User, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth';

const timezones = [
  'Europe/Madrid',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'America/Mexico_City',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export function SettingsPage() {
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      timezone: user?.timezone || 'Europe/Madrid',
    },
  });

  const onSubmit = async (data: any) => {
    // TODO: Implement profile update API
    toast.success('Settings saved (demo)');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-navy-800">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  {...register('firstName', { required: true })}
                  error={errors.firstName?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  {...register('lastName', { required: true })}
                  error={errors.lastName?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Timezone Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Timezone
          </CardTitle>
          <CardDescription>
            Set your timezone for accurate session times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your timezone</Label>
              <Select defaultValue={user?.timezone || 'Europe/Madrid'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => toast.success('Timezone saved (demo)')}>
              Update Timezone
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
