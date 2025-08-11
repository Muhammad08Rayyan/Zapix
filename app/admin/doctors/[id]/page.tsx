"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ArrowLeft,
  Users, 
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Crown,
  Clock,
  Settings,
  Eye,
  EyeOff,
  Edit,
  MessageSquare,
  BarChart3,
  Activity,
  Trash2
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface Doctor {
  id: string;
  name: string;
  email: string;
  personalPhone: string;
  plan: 'none' | 'essential' | 'pro' | 'custom';
  active: boolean;
  createdAt: string;
  appointmentsCount?: number;
  patientsCount?: number;
  messagesUsed?: number;
  monthlyMessageLimit?: number;
  businessPhone?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

type DoctorFormData = {
  name: string;
  personalPhone: string;
  businessPhone: string;
  plan: 'none' | 'essential' | 'pro' | 'custom';
  subscriptionStartDate: string;
  subscriptionEndDate: string;
};

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DoctorFormData>({
    name: "",
    personalPhone: "",
    businessPhone: "",
    plan: "none",
    subscriptionStartDate: "",
    subscriptionEndDate: ""
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        setError("");
        
        const response = await fetch(`/api/doctors/${params.id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch doctor details');
        }
        
        setDoctor(data.data);
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch doctor details');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [params.id]);

  const handleToggleStatus = async () => {
    if (!doctor) return;

    try {
      setError("");
      
      const response = await fetch(`/api/doctors/${doctor.id}/toggle-status`, {
        method: 'PATCH',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle doctor status');
      }
      
      setDoctor(prev => prev ? { ...prev, active: !prev.active } : null);
    } catch (err) {
      console.error('Error toggling doctor status:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle doctor status');
    }
  };

  const openEditDialog = () => {
    if (!doctor) return;
    
    setFormData({
      name: doctor.name,
      personalPhone: doctor.personalPhone || "",
      businessPhone: doctor.businessPhone || "",
      plan: doctor.plan,
      subscriptionStartDate: doctor.subscriptionStartDate || "",
      subscriptionEndDate: doctor.subscriptionEndDate || ""
    });
    setError("");
    setIsEditDialogOpen(true);
  };

  const handleEditDoctor = async () => {
    if (!doctor) return;
    
    if (!formData.name) {
      setError("Name is required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      const response = await fetch(`/api/doctors/${doctor.id}`, {
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
      
      setDoctor(data.data);
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating doctor:', err);
      setError(err instanceof Error ? err.message : 'Failed to update doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!doctor) return;

    try {
      setError("");
      
      const response = await fetch(`/api/doctors/${doctor.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete doctor');
      }
      
      router.push('/admin/doctors');
    } catch (err) {
      console.error('Error deleting doctor:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete doctor');
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
      case 'none': return <Clock className="h-4 w-4" />;
      case 'essential': return <Shield className="h-4 w-4" />;
      case 'pro': return <Crown className="h-4 w-4" />;
      case 'custom': return <Users className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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
      case 'custom': return 'Enterprise';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="animate-pulse bg-muted rounded-lg h-32"></div>
          <div className="animate-pulse bg-muted rounded-lg h-64"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !doctor) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Doctor Not Found</h3>
              <p className="text-muted-foreground mb-4">
                {error || "The requested doctor could not be found."}
              </p>
              <Button onClick={() => router.push('/admin/doctors')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Doctors
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/admin/doctors')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Doctor Details</h1>
              <p className="text-muted-foreground">Complete information about {doctor.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleToggleStatus}
            >
              {doctor.active ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </Button>
            
            <Button onClick={openEditDialog}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
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
                    onClick={handleDeleteDoctor}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{doctor.name}</h3>
                  <Badge variant={doctor.active ? "default" : "secondary"} className="mt-1">
                    {doctor.active ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active Account
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive Account
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{doctor.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Joined {new Date(doctor.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Personal: {doctor.personalPhone || 'Not provided'}</span>
                    <span className="text-sm text-muted-foreground">Business: {doctor.businessPhone || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Subscription Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPlanIcon(doctor.plan)}
                  <div>
                    <div className="font-semibold">{getPlanDisplayName(doctor.plan)} Plan</div>
                    <div className="text-sm text-muted-foreground">
                      {doctor.plan === 'none' ? 'Account inactive - no plan assigned' : 
                       doctor.plan === 'essential' ? '₨10,000/month • 1,000 messages' :
                       doctor.plan === 'pro' ? '₨15,000/month • 2,500 messages' :
                       'Custom pricing • Custom features'}
                    </div>
                  </div>
                </div>
                <Badge variant={getPlanBadgeVariant(doctor.plan)}>
                  {getPlanDisplayName(doctor.plan)}
                </Badge>
              </div>
              
              <Separator />

              {/* Subscription Dates */}
              {doctor.plan !== 'none' && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Start Date</Label>
                    <p className="text-sm font-medium">
                      {doctor.subscriptionStartDate 
                        ? new Date(doctor.subscriptionStartDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short', 
                            year: 'numeric'
                          })
                        : 'Not set'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">End Date</Label>
                    <p className="text-sm font-medium">
                      {doctor.subscriptionEndDate 
                        ? new Date(doctor.subscriptionEndDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short', 
                            year: 'numeric'
                          })
                        : 'Not set'
                      }
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Messages Used</span>
                  <span className="text-sm">{doctor.messagesUsed || 0} / {getMessageLimit(doctor.plan)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${Math.min((doctor.messagesUsed || 0) / getMessageLimit(doctor.plan) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Activity Summary
            </CardTitle>
            <CardDescription>
              Overview of doctor's activity and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {doctor.active ? <CheckCircle className="h-6 w-6 text-green-500" /> : <XCircle className="h-6 w-6 text-red-500" />}
                </div>
                <div className="text-xl font-bold mb-1">{doctor.active ? 'Active' : 'Inactive'}</div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-xl font-bold mb-1">{doctor.appointmentsCount || 0}</div>
                <div className="text-sm text-muted-foreground">Appointments</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-xl font-bold mb-1">{doctor.patientsCount || 0}</div>
                <div className="text-sm text-muted-foreground">Patients</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-xl font-bold mb-1">{doctor.messagesUsed || 0}</div>
                <div className="text-sm text-muted-foreground">of {getMessageLimit(doctor.plan)} limit</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setError("");
            setFormData({ name: "", personalPhone: "", businessPhone: "", plan: "none", subscriptionStartDate: "", subscriptionEndDate: "" });
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Doctor Account</DialogTitle>
              <DialogDescription>
                Update doctor information, plan, and subscription dates
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-plan">Subscription Plan</Label>
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
                          <div className="text-xs text-muted-foreground">Account inactive</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="essential">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Essential</div>
                          <div className="text-xs text-muted-foreground">₨10,000/month • 1,000 messages</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="pro">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Pro</div>
                          <div className="text-xs text-muted-foreground">₨15,000/month • 2,500 messages</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="custom">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Enterprise</div>
                          <div className="text-xs text-muted-foreground">Custom pricing • Custom features</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-personal-phone">Personal Phone Number</Label>
                <Input
                  id="edit-personal-phone"
                  value={formData.personalPhone}
                  onChange={(e) => setFormData({...formData, personalPhone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-business-phone">Business Phone Number</Label>
                <Input
                  id="edit-business-phone"
                  value={formData.businessPhone}
                  onChange={(e) => setFormData({...formData, businessPhone: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-start-date">Subscription Start Date</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={formData.subscriptionStartDate}
                  onChange={(e) => setFormData({...formData, subscriptionStartDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-end-date">Subscription End Date</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={formData.subscriptionEndDate}
                  onChange={(e) => setFormData({...formData, subscriptionEndDate: e.target.value})}
                />
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
      </div>
    </AdminLayout>
  );
}