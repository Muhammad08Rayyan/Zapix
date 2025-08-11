"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Users, 
  Settings, 
  LogOut,
  Sun, 
  Moon,
  Menu,
  X,
  Plus,
  Activity,
  User,
  DollarSign,
  Clock,
  AlertTriangle,
  Lock,
  MessageCircle
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Doctor } from "@/types";
import { checkPlanStatus, shouldRestrictAccess, getPlanStatusMessage } from "@/lib/plan-utils";
import { getPlanConfig } from "@/lib/plan-config";

interface DoctorLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/doctor",
    icon: Activity,
    description: "Overview & Analytics"
  },
  {
    title: "Bookings",
    href: "/doctor/bookings",
    icon: Clock,
    description: "Booking Requests"
  },
  {
    title: "Patients",
    href: "/doctor/patients", 
    icon: Users,
    description: "Patient Records"
  },
  {
    title: "Slots",
    href: "/doctor/slots",
    icon: Plus,
    description: "Availability Management"
  },
  {
    title: "Payment Settings",
    href: "/doctor/payment-settings",
    icon: DollarSign,
    description: "Payment Methods & Pricing"
  },
  {
    title: "Settings",
    href: "/doctor/settings",
    icon: Settings,
    description: "Account Preferences"
  }
];

export default function DoctorLayout({ children }: DoctorLayoutProps) {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

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

    if (session?.user?.doctorId) {
      fetchDoctor();
    }
  }, [session]);

  // Redirect to dashboard if accessing restricted page without active plan
  useEffect(() => {
    if (doctor && shouldRestrictAccess(doctor) && pathname !== '/doctor') {
      router.push('/doctor');
    }
  }, [doctor, pathname, router]);

  if (!mounted || status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== "doctor") {
    return null;
  }

  const restrictAccess = shouldRestrictAccess(doctor);
  const planStatus = checkPlanStatus(doctor);
  const planConfig = doctor ? getPlanConfig(doctor.plan) : null;

  const handleContactAdmin = () => {
    router.push('/?scrollTo=contact');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-80 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Zapix Doctor
                </h2>
                <p className="text-xs text-sidebar-foreground">Healthcare Dashboard</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Plan Status Notice */}
          {restrictAccess && (
            <div className="mx-4 mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                    Plan Required
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {getPlanStatusMessage(doctor)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isRestricted = restrictAccess && item.href !== '/doctor';
              
              if (isRestricted) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg opacity-50 cursor-not-allowed"
                  >
                    <Lock className="h-5 w-5 text-sidebar-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sidebar-foreground">{item.title}</p>
                      <p className="text-xs text-sidebar-foreground/70">
                        Requires active plan
                      </p>
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground group-hover:text-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className={`text-xs ${isActive ? "text-sidebar-primary-foreground/70" : "text-sidebar-foreground/70"}`}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="bg-sidebar-accent rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{session.user.name}</p>
                  <p className="text-xs text-sidebar-foreground">Healthcare Provider</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="flex-1 text-sidebar-foreground hover:text-foreground hover:bg-background"
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex-1 text-sidebar-foreground hover:text-destructive hover:bg-background"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-80">
        {/* Top bar */}
        <header className="bg-background/95 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {sidebarItems.find(item => item.href === pathname)?.title || "Doctor Dashboard"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {sidebarItems.find(item => item.href === pathname)?.description || "Healthcare practice management"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleContactAdmin}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Admin
              </Button>
              {planStatus.hasValidPlan ? (
                <Badge className={`${
                  planStatus.isActive && !planStatus.isExpired
                    ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                    : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    planStatus.isActive && !planStatus.isExpired
                      ? "bg-green-500 animate-pulse"
                      : "bg-amber-500"
                  }`}></div>
                  {planStatus.isExpired 
                    ? "Plan Expired"
                    : planStatus.isActive 
                      ? `${planConfig?.displayName} Plan`
                      : "Plan Inactive"
                  }
                </Badge>
              ) : (
                <Badge className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                  No Plan
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}