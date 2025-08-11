"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Users, 
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  Settings
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: 'none' | 'essential' | 'pro' | 'custom';
  active: boolean;
  createdAt: string;
  appointmentsCount?: number;
  patientsCount?: number;
  messagesUsed?: number;
  monthlyMessageLimit?: number;
}

type DoctorFormData = {
  name: string;
  email: string;
  phone: string;
  plan: 'none' | 'essential' | 'pro' | 'custom';
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<DoctorFormData>({
    name: "",
    email: "",
    phone: "",
    plan: "none"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch doctors from API
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterPlan !== 'all') params.append('plan', filterPlan);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await fetch(`/api/doctors?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch doctors');
      }
      
      setDoctors(data.doctors);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterPlan, filterStatus]);

  // Load doctors on component mount and when filters change
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Since filtering is now done server-side, we just use the doctors array directly
  const filteredDoctors = doctors;

  const handleCreateDoctor = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError("All fields are required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone
          // Don't send plan - doctor will be created with 'none' plan
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create doctor');
      }
      
      // Show temporary password to admin (in production, send via email)
      if (data.tempPassword) {
        alert(`Doctor created successfully!\nTemporary password: ${data.tempPassword}\nPlease share this with the doctor securely.`);
      }
      
      setIsCreateDialogOpen(false);
      setFormData({ name: "", email: "", phone: "", plan: "none" });
      
      // Refresh the doctors list
      fetchDoctors();
    } catch (err) {
      console.error('Error creating doctor:', err);
      setError(err instanceof Error ? err.message : 'Failed to create doctor');
    } finally {
      setIsSubmitting(false);
    }
  };


  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'none': return 'destructive';
      case 'essential': return 'outline';
      case 'pro': return 'default';
      case 'custom': return 'secondary';
      default: return 'outline';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'none': return <Clock className="h-3 w-3" />;
      case 'essential': return <Shield className="h-3 w-3" />;
      case 'pro': return <Crown className="h-3 w-3" />;
      case 'custom': return <Users className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getMessageLimit = (plan: string) => {
    switch (plan) {
      case 'none': return 0;
      case 'essential': return 1000;
      case 'pro': return 2500;
      case 'custom': return 10000;
      default: return 0;
    }
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'none': return 'No Plan';
      case 'essential': return 'Essential';
      case 'pro': return 'Pro';
      case 'custom': return 'Custom';
      default: return 'Unknown';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Doctor Management</h2>
            <p className="text-muted-foreground">Manage healthcare providers and their access</p>
            {error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setError(""); // Clear errors when dialog closes
              setFormData({ name: "", email: "", phone: "", plan: "none" });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Doctor Account</DialogTitle>
                <DialogDescription>
                  Add a new healthcare provider to the system
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Full Name</Label>
                  <Input
                    id="create-name"
                    placeholder="Dr. John Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-email">Email Address</Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="doctor@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-phone">Phone Number</Label>
                  <Input
                    id="create-phone"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-plan">Subscription Plan</Label>
                  <Select value={formData.plan} onValueChange={(value: 'none' | 'essential' | 'pro' | 'custom') => setFormData({...formData, plan: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <div>
                            <div className="font-medium">No Plan</div>
                            <div className="text-xs text-muted-foreground">Account inactive - waiting for plan assignment</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="essential">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Essential</div>
                            <div className="text-xs text-muted-foreground">1,000 messages/month • ₨10,000 • Locked settings</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="pro">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Pro</div>
                            <div className="text-xs text-muted-foreground">2,500 messages/month • ₨15,000 • Full customization</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="custom">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Enterprise</div>
                            <div className="text-xs text-muted-foreground">Custom conversations • Custom pricing • Dedicated support</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDoctor} disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Doctor"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search doctors by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="none">No Plan</SelectItem>
                  <SelectItem value="essential">Essential</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading doctors...</span>
          </div>
        )}

        {/* Doctors Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card 
                key={doctor.id} 
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-background to-muted/20"
                onClick={() => window.location.href = `/admin/doctors/${doctor.id}`}
              >
                <CardContent className="p-6">
                  {/* Header Section */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-2">
                      {doctor.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant={doctor.active ? "default" : "secondary"} className="text-xs">
                        {doctor.active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                      <Badge variant={getPlanBadgeVariant(doctor.plan)} className="text-xs">
                        {getPlanIcon(doctor.plan)}
                        <span className="ml-1">{getPlanDisplayName(doctor.plan)}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">{doctor.appointmentsCount || 0}</div>
                      <div className="text-xs text-blue-600/70">Appointments</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-xl font-bold text-green-600">{doctor.patientsCount || 0}</div>
                      <div className="text-xs text-green-600/70">Patients</div>
                    </div>
                  </div>

                  {/* Contact Info - Minimal */}
                  <div className="space-y-2 text-center mb-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate max-w-[180px]">{doctor.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(doctor.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Message Usage Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Messages Used</span>
                      <span className="text-xs text-muted-foreground">
                        {doctor.messagesUsed || 0}/{getMessageLimit(doctor.plan)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min((doctor.messagesUsed || 0) / getMessageLimit(doctor.plan) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Click to view indicator */}
                  <div className="text-center pt-2 border-t">
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to view details
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}


        {!loading && filteredDoctors.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterPlan !== 'all' || filterStatus !== 'all' 
                  ? "Try adjusting your search or filters" 
                  : "No doctors have been added yet"}
              </p>
              {(searchTerm || filterPlan !== 'all' || filterStatus !== 'all') && (
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setFilterPlan("all");
                    setFilterStatus("all");
                  }}
                  variant="outline"
                >
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}