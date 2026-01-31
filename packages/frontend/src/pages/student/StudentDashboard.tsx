import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, BookOpen, Clock, ArrowRight, Video, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { studentApi } from '@/lib/api';
import { formatDate, formatTime, getDuration, getRelativeTime } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';

export function StudentDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: studentApi.getDashboard,
  });

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">Here's your learning overview.</p>
        </div>
        <Button variant="primary" asChild>
          <Link to="/dashboard/book">
            <Calendar className="mr-2 h-4 w-4" />
            Book a Class
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-navy-800">
                    {data?.stats.upcomingBookings || 0}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-green-100 flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Sessions</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-navy-800">
                    {data?.stats.completedSessions || 0}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Next Session */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Next Session</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/bookings">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : data?.nextSession ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-2 border-gold-200 bg-gold-50">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-gold-500 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-navy-800" />
                </div>
                <div>
                  <Badge variant="gold" className="mb-2">
                    {getRelativeTime(data.nextSession.slot.startTime)}
                  </Badge>
                  <p className="font-semibold text-lg text-navy-800">
                    {data.nextSession.slot.title || 'Spanish Class'}
                  </p>
                  <p className="text-muted-foreground">
                    {formatDate(data.nextSession.slot.startTime)} at{' '}
                    {formatTime(data.nextSession.slot.startTime)}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {getDuration(data.nextSession.slot.startTime, data.nextSession.slot.endTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {data.nextSession.slot.professor?.firstName}{' '}
                      {data.nextSession.slot.professor?.lastName}
                    </span>
                  </div>
                </div>
              </div>
              {data.nextSession.slot.googleMeetLink && (
                <Button variant="primary" asChild>
                  <a
                    href={data.nextSession.slot.googleMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Join Session
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">No upcoming sessions</p>
              <Button variant="primary" asChild>
                <Link to="/dashboard/book">Book Your First Class</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/dashboard/book">
          <Card hover className="cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-navy-800">Browse Available Classes</p>
                <p className="text-sm text-muted-foreground">Find and book your next session</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/bookings">
          <Card hover className="cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-navy-800">My Bookings</p>
                <p className="text-sm text-muted-foreground">View and manage your sessions</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
