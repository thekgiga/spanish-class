import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Calendar, BookOpen, Clock, ArrowRight, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { professorApi } from '@/lib/api';
import { formatTime, getDuration } from '@/lib/utils';

export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['professor-dashboard'],
    queryFn: professorApi.getDashboard,
  });

  const stats = [
    {
      label: 'Total Students',
      value: data?.stats.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Active Bookings',
      value: data?.stats.totalBookings || 0,
      icon: BookOpen,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Upcoming Slots',
      value: data?.stats.upcomingSlots || 0,
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: "Today's Sessions",
      value: data?.stats.todaySessions || 0,
      icon: Clock,
      color: 'bg-gold-100 text-gold-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
        </div>
        <Button variant="primary" asChild>
          <Link to="/admin/slots/new">
            <Calendar className="mr-2 h-4 w-4" />
            Create New Slot
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold text-navy-800 mt-1">{stat.value}</p>
                    )}
                  </div>
                  <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Today's Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today's Sessions</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/calendar">
              View Calendar <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : data?.todaysSlots && data.todaysSlots.length > 0 ? (
            <div className="space-y-4">
              {data.todaysSlots.map((slot: any) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-navy-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-navy-600" />
                    </div>
                    <div>
                      <p className="font-medium text-navy-800">
                        {slot.title || 'Spanish Class'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)} ({getDuration(slot.startTime, slot.endTime)})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant={slot.slotType === 'GROUP' ? 'secondary' : 'default'}>
                        {slot.slotType === 'GROUP' ? 'Group' : 'Individual'}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {slot.currentParticipants}/{slot.maxParticipants} booked
                      </p>
                    </div>
                    {slot.googleMeetLink && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={slot.googleMeetLink} target="_blank" rel="noopener noreferrer">
                          <Video className="mr-1 h-4 w-4" />
                          Join
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sessions scheduled for today</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/admin/slots/new">Create a Slot</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/admin/students">
          <Card hover className="cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-navy-800">View Students</p>
                <p className="text-sm text-muted-foreground">Manage student profiles</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/slots">
          <Card hover className="cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-navy-800">Manage Availability</p>
                <p className="text-sm text-muted-foreground">Edit your schedule</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/settings">
          <Card hover className="cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-navy-800">Account Settings</p>
                <p className="text-sm text-muted-foreground">Update your profile</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
