"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Clock,
  Plus,
  Activity,
  CheckCircle,
  AlertCircle,
  DollarSign
} from "lucide-react";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function DoctorDashboard() {
  const { data: session } = useSession();

  return (
    <DoctorLayout>
      <div className="space-y-8">
        {/* Welcome Message */}
        <div className="bg-muted/50 border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome back, {session?.user?.name}! 👋
          </h2>
          <p className="text-muted-foreground">
            Ready to help your patients today. Here&apos;s your practice overview.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No appointments scheduled
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Registered patients
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WhatsApp Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                New messages
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks to manage your practice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild>
                  <Link href="/doctor/slots">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Slot
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/doctor/appointments">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/doctor/patients">
                    <Users className="h-4 w-4 mr-2" />
                    Patient Records
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/doctor/messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Practice Status
              </CardTitle>
              <CardDescription>
                Current account and system status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan</span>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">Premium</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">WhatsApp Bot</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">Connected</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payment Method</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">Setup Required</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Complete your profile setup to start accepting patients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Account created</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span className="text-sm">Add payment details</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground"></div>
                  <span className="text-sm text-muted-foreground">Create your first appointment slot</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground"></div>
                  <span className="text-sm text-muted-foreground">Configure WhatsApp notifications</span>
                </div>
              </div>
              <Button asChild className="w-full mt-4">
                <Link href="/doctor/settings">Complete Setup</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Logged in: {session?.user?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Just now</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">Premium plan features enabled</p>
                    <p className="text-xs text-muted-foreground mt-1">5 min ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">WhatsApp integration ready</p>
                    <p className="text-xs text-muted-foreground mt-1">10 min ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Account Summary
            </CardTitle>
            <CardDescription>
              Your current plan and usage overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">Premium</div>
                <p className="text-xs text-muted-foreground">Current Plan</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">500</div>
                <p className="text-xs text-muted-foreground">Monthly Limit</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <p className="text-xs text-muted-foreground">Used This Month</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Jan 31</div>
                <p className="text-xs text-muted-foreground">Next Billing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}