import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Users, Search, Calendar, ArrowRight, UserPlus, Mail, Clock, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { professorApi } from "@/lib/api";
import { getInitials, formatDate } from "@/lib/utils";
import { InviteStudentModal } from "@/components/professor/InviteStudentModal";
import { CreateCoverModal } from "@/components/professor/CreateCoverModal";

export function StudentsPage() {
  const { t } = useTranslation("admin");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["professor-students"],
    queryFn: () => professorApi.getStudents({ limit: 100 }),
  });

  const { data: invitations } = useQuery({
    queryKey: ["professor-pending-invitations"],
    queryFn: professorApi.getPendingInvitations,
  });

  const { data: covers } = useQuery({
    queryKey: ["professor-covers"],
    queryFn: professorApi.listCovers,
  });

  const removeStudentMutation = useMutation({
    mutationFn: (studentId: string) => professorApi.removeStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professor-students"] });
      toast.success(t("students.assignment.student_removed"));
    },
    onError: (error: any) => toast.error(error.response?.data?.error || "Failed to remove student"),
  });

  const deleteCoverMutation = useMutation({
    mutationFn: (coverId: string) => professorApi.deleteCover(coverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professor-covers"] });
      toast.success(t("students.assignment.cover_deleted"));
    },
    onError: (error: any) => toast.error(error.response?.data?.error || "Failed to delete cover"),
  });

  const filteredStudents = data?.data?.filter(
    (student: any) =>
      student.firstName.toLowerCase().includes(search.toLowerCase()) ||
      student.lastName.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-navy-800">
            {t("students.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("students.page.registered_count", { count: data?.pagination.total || 0 })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCoverModal(true)}>
            <Clock className="h-4 w-4 mr-2" />
            {t("students.assignment.cover_button")}
          </Button>
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            {t("students.assignment.invite_button")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            {t("students.assignment.tab_assigned")}
            {data?.pagination.total ? (
              <Badge variant="neutral" className="ml-2 text-xs">{data.pagination.total}</Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="covers">
            <Clock className="h-4 w-4 mr-2" />
            {t("students.assignment.tab_covers")}
            {covers?.length ? (
              <Badge variant="neutral" className="ml-2 text-xs">{covers.length}</Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="invitations">
            <Mail className="h-4 w-4 mr-2" />
            {t("students.assignment.tab_invitations")}
            {invitations?.length ? (
              <Badge className="ml-2 text-xs bg-amber-500">{invitations.length}</Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        {/* Assigned Students Tab */}
        <TabsContent value="students" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("students.page.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
            </div>
          ) : filteredStudents && filteredStudents.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((student: any, index: number) => (
                <motion.div key={student.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card hover>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-navy-100 text-navy-700">
                            {getInitials(student.firstName, student.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-navy-800 truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {t("students.page.bookings_count", { count: student._count.bookings })}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                          onClick={() => {
                            if (confirm(t("students.assignment.remove_student_confirm"))) {
                              removeStudentMutation.mutate(student.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/students/${student.id}`}>
                            {t("students.page.view")} <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">
                  {search ? t("students.page.no_search_results") : t("students.assignment.no_assigned")}
                </p>
                {!search && (
                  <Button onClick={() => setShowInviteModal(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t("students.assignment.invite_first_button")}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cover Periods Tab */}
        <TabsContent value="covers" className="space-y-4 mt-4">
          {!covers?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">{t("students.assignment.no_covers")}</p>
                <Button onClick={() => setShowCoverModal(true)}>
                  <Clock className="h-4 w-4 mr-2" />
                  {t("students.assignment.cover_create_button")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {covers.map((cover: any) => (
                <Card key={cover.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {cover.student.firstName} {cover.student.lastName}
                        <span className="text-slate-400 mx-2">→</span>
                        <span className="text-spanish-teal-700">
                          Prof. {cover.coverProfessor.firstName} {cover.coverProfessor.lastName}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(cover.startsAt).toLocaleDateString(undefined)} – {new Date(cover.endsAt).toLocaleDateString(undefined)}
                        {new Date(cover.endsAt) < new Date() && (
                          <Badge variant="neutral" className="ml-2 text-xs">{t("students.assignment.cover_expired")}</Badge>
                        )}
                        {new Date(cover.startsAt) <= new Date() && new Date(cover.endsAt) >= new Date() && (
                          <Badge className="ml-2 text-xs bg-green-500">{t("students.assignment.cover_active")}</Badge>
                        )}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteCoverMutation.mutate(cover.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pending Invitations Tab */}
        <TabsContent value="invitations" className="space-y-4 mt-4">
          {!invitations?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">{t("students.assignment.no_invitations")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv: any) => (
                <Card key={inv.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{inv.email}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Invited {formatDate(inv.createdAt)} · Expires {formatDate(inv.expiresAt)}
                      </p>
                    </div>
                    <Badge variant="neutral" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {t("students.assignment.cover_pending")}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <InviteStudentModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
      />
      <CreateCoverModal
        open={showCoverModal}
        onOpenChange={setShowCoverModal}
        students={data?.data ?? []}
      />
    </div>
  );
}
