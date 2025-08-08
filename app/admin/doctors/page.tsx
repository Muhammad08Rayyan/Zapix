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
  Crown,
  Settings
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: 'basic' | 'premium' | 'custom';
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
  plan: 'basic' | 'premium' | 'custom';
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<DoctorFormData>({
    name: "",
    email: "",
    phone: "",
    plan: "basic"
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
        body: JSON.stringify(formData),
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
      setFormData({ name: "", email: "", phone: "", plan: "basic" });
      
      // Refresh the doctors list
      fetchDoctors();
    } catch (err) {
      console.error('Error creating doctor:', err);
      setError(err instanceof Error ? err.message : 'Failed to create doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDoctor = async () => {
    if (!selectedDoctor) {
      setError("No doctor selected");
      return;
    }
    
    if (!formData.name || !formData.email || !formData.phone) {
      setError("All fields are required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      console.log('Updating doctor:', selectedDoctor.id, formData); // Debug log
      
      const response = await fetch(`/api/doctors/${selectedDoctor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update doctor');
      }
      
      setIsEditDialogOpen(false);
      setSelectedDoctor(null);
      setFormData({ name: "", email: "", phone: "", plan: "basic" });
      
      // Refresh the doctors list
      fetchDoctors();
    } catch (err) {
      console.error('Error updating doctor:', err);
      setError(err instanceof Error ? err.message : 'Failed to update doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (doctorId: string) => {
    try {
      setError("");
      
      const response = await fetch(`/api/doctors/${doctorId}/toggle-status`, {
        method: 'PATCH',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle doctor status');
      }
      
      // Refresh the doctors list
      fetchDoctors();
    } catch (err) {
      console.error('Error toggling doctor status:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle doctor status');
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    try {
      setError("");
      
      console.log('Deleting doctor:', doctorId); // Debug log
      
      const response = await fetch(`/api/doctors/${doctorId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete doctor');
      }
      
      // Refresh the doctors list
      fetchDoctors();
    } catch (err) {
      console.error('Error deleting doctor:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete doctor');
    }
  };

  const openEditDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      plan: doctor.plan
    });
    setError(""); // Clear any previous errors
    setIsEditDialogOpen(true);
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'premium': return 'default';
      case 'custom': return 'secondary';
      default: return 'outline';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'basic': return <Shield className="h-3 w-3" />;
      case 'premium': return <Crown className="h-3 w-3" />;
      case 'custom': return <Users className="h-3 w-3" />;
      default: return <Shield className="h-3 w-3" />;
    }
  };

  const getMessageLimit = (plan: string) => {
    switch (plan) {
      case 'basic': return 1000;
      case 'premium': return 2500;
      case 'custom': return 10000;
      default: return 1000;
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
              setFormData({ name: "", email: "", phone: "", plan: "basic" });
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
                  <Select value={formData.plan} onValueChange={(value: 'basic' | 'premium' | 'custom') => setFormData({...formData, plan: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Basic</div>
                            <div className="text-xs text-muted-foreground">1,000 conversations/month • ₨10,000</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="premium">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Premium</div>
                            <div className="text-xs text-muted-foreground">2,500 conversations/month • ₨15,000 • Priority support</div>
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
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardContent className="p-6">
                  {/* Header with Avatar & Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {doctor.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
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
                        </div>
                      </div>
                    </div>
                    
                    {/* Plan Badge */}
                    <Badge variant={getPlanBadgeVariant(doctor.plan)} className="shrink-0">
                      {getPlanIcon(doctor.plan)}
                      <span className="ml-1 capitalize">{doctor.plan}</span>
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{doctor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>Joined {new Date(doctor.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{doctor.appointmentsCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Appointments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{doctor.patientsCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Patients</div>
                    </div>
                  </div>

                  {/* Message Usage */}
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Monthly Conversations</span>
                      <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                        {getMessageLimit(doctor.plan)} limit
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-blue-200 dark:bg-blue-900/50 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min((doctor.messagesUsed || 0) / getMessageLimit(doctor.plan) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {doctor.messagesUsed || 0}/{getMessageLimit(doctor.plan)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(doctor.id)}
                      className="flex-1"
                    >
                      {doctor.active ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(doctor)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Doctor Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {doctor.name}&apos;s account? This action cannot be undone and will remove all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteDoctor(doctor.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setError(""); // Clear errors when dialog closes
            setSelectedDoctor(null);
            setFormData({ name: "", email: "", phone: "", plan: "basic" });
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Doctor Account</DialogTitle>
              <DialogDescription>
                Update doctor information and settings
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-plan">Subscription Plan</Label>
                <Select value={formData.plan} onValueChange={(value: 'basic' | 'premium' | 'custom') => setFormData({...formData, plan: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Basic</div>
                          <div className="text-xs text-muted-foreground">1,000 conversations/month • ₨10,000</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="premium">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Premium</div>
                          <div className="text-xs text-muted-foreground">2,500 conversations/month • ₨15,000 • Priority support</div>
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
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditDoctor}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Doctor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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