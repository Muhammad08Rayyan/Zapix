"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus,
  Activity,
  CheckCircle,
  AlertCircle,
  Crown,
  Users,
  Clock,
  AlertTriangle
} from "lucide-react";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Doctor } from "@/types";
import { getPlanConfig } from "@/lib/plan-config";
import { shouldRestrictAccess } from "@/lib/plan-utils";

export default function DoctorDashboard() {
  const { data: session } = useSession();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!session?.user?.doctorId) return;
      
      try {
        const response = await fetch(`/api/doctors/${session.user.doctorId}`);
        if (response.ok) {
          const data = await response.json();
          setDoctor(data.data);
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [session]);

  if (loading) {
    return (
      <DoctorLayout>
        <div className="space-y-8">
          <div className="animate-pulse bg-muted rounded-lg h-32"></div>
          <div className="animate-pulse bg-muted rounded-lg h-64"></div>
        </div>
      </DoctorLayout>
    );
  }

  const planConfig = doctor ? getPlanConfig(doctor.plan) : null;
  const isNoPlan = doctor?.plan === 'none' || !planConfig;
  const restrictAccess = shouldRestrictAccess(doctor);

  const getPlanIcon = () => {
    if (isNoPlan) return <AlertTriangle className="h-8 w-8 text-white" />;
    return <Crown className="h-8 w-8 text-white" />;
  };

  const getPlanTitle = () => {
    if (isNoPlan) return "No Plan Assigned";
    return `${planConfig?.displayName} Plan Active`;
  };

  const getPlanDescription = () => {
    if (isNoPlan) return "Contact admin to get a plan assigned and start using all features";
    return planConfig?.description || "Access to all plan features";
  };

  const getPlanGradient = () => {
    if (isNoPlan) return "from-gray-500 to-gray-600";
    if (doctor?.plan === 'essential') return "from-blue-500 to-blue-600";
    if (doctor?.plan === 'pro') return "from-purple-500 to-primary";
    return "from-amber-500 to-amber-600"; // custom
  };

  const getMessageStats = () => {
    if (!doctor) return { used: 0, limit: 0 };
    return {
      used: doctor.messageStats.messagesUsed,
      limit: doctor.messageStats.monthlyLimit
    };
  };

  const messageStats = getMessageStats();

  return (
    <DoctorLayout>
      <div className="space-y-8">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome back, Dr. {session?.user?.name}! 👋
          </h2>
          <p className="text-muted-foreground">
            Your practice management dashboard - everything you need to serve your patients.
          </p>
        </div>

        {/* Plan Status - Main Focus */}
        <Card className={`border-2 shadow-lg ${isNoPlan ? 'border-amber-500/50' : 'border-primary/20'}`}>
          <CardHeader className="text-center pb-2">
            <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${getPlanGradient()} rounded-full flex items-center justify-center mb-4`}>
              {getPlanIcon()}
            </div>
            <CardTitle className="text-2xl">{getPlanTitle()}</CardTitle>
            <CardDescription>
              {getPlanDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {isNoPlan ? (
              <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Plan Assignment Required
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Your account needs a plan assignment from the admin to access appointment booking, patient management, and WhatsApp automation features.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className={`text-3xl font-bold ${doctor?.active ? 'text-green-600' : 'text-amber-600'}`}>
                    {doctor?.active ? 'Active' : 'Inactive'}
                  </div>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">{messageStats.used}</div>
                  <p className="text-sm text-muted-foreground">Messages Used</p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-purple-600">
                    {messageStats.limit === 0 ? 'Unlimited' : messageStats.limit.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Monthly Limit</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - Only show if plan is active */}
        {!restrictAccess && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Get started with managing your practice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Button asChild className="h-auto py-4 flex-col gap-2">
                  <Link href="/doctor/slots">
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">Add Slot</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Link href="/doctor/bookings">
                    <Clock className="h-6 w-6" />
                    <span className="text-sm">View Bookings</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Link href="/doctor/patients">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Patients</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Link href="/doctor/payment-settings">
                    <Activity className="h-6 w-6" />
                    <span className="text-sm">Settings</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Progress</CardTitle>
            <CardDescription>
              {isNoPlan ? "Complete plan assignment to unlock setup steps" : "Complete these steps to optimize your practice"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {doctor ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
                <span className="text-sm">Account created</span>
              </div>
              
              <div className="flex items-center gap-3">
                {isNoPlan ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                <span className="text-sm">
                  {isNoPlan ? "Waiting for plan assignment" : `${planConfig?.displayName} plan assigned`}
                </span>
                {isNoPlan && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    Contact Admin
                  </Badge>
                )}
              </div>

              {!isNoPlan && (
                <>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span className="text-sm">Configure payment methods</span>
                    <Button asChild size="sm" variant="outline" className="ml-auto">
                      <Link href="/doctor/payment-settings">Setup</Link>
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span className="text-sm">Create appointment slots</span>
                    <Button asChild size="sm" variant="outline" className="ml-auto">
                      <Link href="/doctor/slots">Create</Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}