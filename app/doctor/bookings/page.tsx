"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  FileImage,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Loader2,
  Eye,
  MessageCircle,
  DollarSign,
  Download
} from "lucide-react";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import { format } from "date-fns";

interface BookingRequest {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | 'other';
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: 'in_person' | 'video_call' | 'phone_call';
  duration: number;
  price: number;
  address?: string;
  paymentReceiptUrl?: string;
  documents: string[];
  notes: string;
  symptoms: string;
  medicalHistory: string[];
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  createdAt: string;
  slotId: string;
}

export default function BookingManagementPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [rescheduleNotes, setRescheduleNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("pending");

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`/api/bookings${params.toString() ? `?${params.toString()}` : ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const result = await response.json();
      if (result.success) {
        setBookings(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      setActionLoading(`confirm-${bookingId}`);
      
      const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to confirm booking');
      }

      // Refresh bookings list
      await fetchBookings();
      
      // Close dialog if open
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBooking = async (bookingId: string, reason?: string) => {
    try {
      setActionLoading(`reject-${bookingId}`);
      
      const response = await fetch(`/api/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject booking');
      }

      // Refresh bookings list
      await fetchBookings();
      
      // Close dialog if open
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelForFaultyReceipt = async (bookingId: string) => {
    try {
      setActionLoading(`cancel-${bookingId}`);
      
      const response = await fetch(`/api/bookings/${bookingId}/cancel-faulty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel booking');
      }

      // Refresh bookings list
      await fetchBookings();
      
      // Close dialog if open
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReschedule = async (bookingId: string) => {
    try {
      setActionLoading(`reschedule-${bookingId}`);
      
      const response = await fetch(`/api/bookings/${bookingId}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: rescheduleNotes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reschedule booking');
      }

      // Refresh bookings list
      await fetchBookings();
      
      // Close dialogs
      setRescheduleDialog(false);
      setRescheduleNotes("");
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule booking');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'in_person':
        return <MapPin className="h-4 w-4" />;
      case 'video_call':
        return <MessageCircle className="h-4 w-4" />;
      case 'phone_call':
        return <Phone className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="py-20">
              <div className="text-center space-y-6">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <div className="space-y-2">
                  <p className="font-medium">Loading booking requests...</p>
                  <p className="text-sm text-muted-foreground">Please wait while we fetch your booking requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Review and manage patient booking requests. Confirm appointments, check payment receipts, and handle scheduling.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError(null)}
                className="ml-4"
              >
                ×
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Bookings</CardTitle>
            <CardDescription>View bookings by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All Bookings' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'cancelled', label: 'Cancelled' }
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={filterStatus === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center space-y-6">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No Booking Requests</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {filterStatus === 'all' 
                      ? "You don't have any booking requests yet. Patients will see your available slots and can book appointments."
                      : `No ${filterStatus} booking requests found.`
                    }
                  </p>
                </div>
                <Button onClick={fetchBookings} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4 flex-1">
                      {/* Patient Info */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <User className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{booking.patientName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.patientAge} years • {booking.patientGender} • {booking.patientPhone}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>

                      {/* Appointment Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(booking.appointmentDate), 'PPP')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{booking.appointmentTime} ({booking.duration} min)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {getTypeIcon(booking.appointmentType)}
                          <span>{booking.appointmentType.replace('_', ' ')}</span>
                        </div>
                      </div>

                      {/* Price and Receipt */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>Rs. {Number(booking.price).toLocaleString('en-PK')}</span>
                        </div>
                        {booking.paymentReceiptUrl && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileImage className="h-4 w-4 text-muted-foreground" />
                            <span>Receipt Available</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Actions for Pending */}
                      {booking.status === 'pending' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleConfirmBooking(booking.id)}
                            disabled={actionLoading === `confirm-${booking.id}`}
                            className="gap-2"
                          >
                            {actionLoading === `confirm-${booking.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectBooking(booking.id)}
                            disabled={actionLoading === `reject-${booking.id}`}
                            className="gap-2"
                          >
                            {actionLoading === `reject-${booking.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Reject
                          </Button>
                          {booking.paymentReceiptUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelForFaultyReceipt(booking.id)}
                              disabled={actionLoading === `cancel-${booking.id}`}
                              className="gap-2"
                            >
                              {actionLoading === `cancel-${booking.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <AlertCircle className="h-4 w-4" />
                              )}
                              Faulty Receipt
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBooking(booking)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Booking Details Dialog */}
        {selectedBooking && (
          <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Booking Request Details</DialogTitle>
                <DialogDescription>
                  Complete information for this booking request
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Patient Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedBooking.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Age & Gender</p>
                      <p className="font-medium">{selectedBooking.patientAge} years, {selectedBooking.patientGender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedBooking.patientPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(selectedBooking.status)}>
                        {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Appointment Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Appointment Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Date & Time</p>
                      <p className="font-medium">
                        {format(new Date(selectedBooking.appointmentDate), 'PPP')} at {selectedBooking.appointmentTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{selectedBooking.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(selectedBooking.appointmentType)}
                        <p className="font-medium">{selectedBooking.appointmentType.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fee</p>
                      <p className="font-medium">Rs. {Number(selectedBooking.price).toLocaleString('en-PK')}</p>
                    </div>
                  </div>

                  {selectedBooking.address && (
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{selectedBooking.address}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Medical Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Medical Information</h4>
                  {selectedBooking.symptoms && (
                    <div>
                      <p className="text-sm text-muted-foreground">Symptoms / Reason for Visit</p>
                      <p className="font-medium">{selectedBooking.symptoms}</p>
                    </div>
                  )}
                  {selectedBooking.medicalHistory && selectedBooking.medicalHistory.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Medical History</p>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedBooking.medicalHistory.map((item, index) => (
                          <li key={index} className="font-medium">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedBooking.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Additional Notes</p>
                      <p className="font-medium">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>

                {/* Payment Receipt */}
                {selectedBooking.paymentReceiptUrl && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-semibold">Payment Receipt</h4>
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        View Receipt
                      </Button>
                    </div>
                  </>
                )}

                {/* Documents */}
                {selectedBooking.documents && selectedBooking.documents.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-semibold">Patient Documents</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedBooking.documents.map((doc, index) => (
                          <Button key={index} variant="outline" size="sm" className="gap-2">
                            <FileImage className="h-4 w-4" />
                            Document {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Actions */}
                {selectedBooking.status === 'pending' && (
                  <>
                    <Separator />
                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleConfirmBooking(selectedBooking.id)}
                        disabled={actionLoading === `confirm-${selectedBooking.id}`}
                        className="gap-2"
                      >
                        {actionLoading === `confirm-${selectedBooking.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Confirm Booking
                      </Button>
                      
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectBooking(selectedBooking.id)}
                        disabled={actionLoading === `reject-${selectedBooking.id}`}
                        className="gap-2"
                      >
                        {actionLoading === `reject-${selectedBooking.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Reject Booking
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setRescheduleDialog(true)}
                        className="gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Propose Reschedule
                      </Button>

                      {selectedBooking.paymentReceiptUrl && (
                        <Button
                          variant="outline"
                          onClick={() => handleCancelForFaultyReceipt(selectedBooking.id)}
                          disabled={actionLoading === `cancel-${selectedBooking.id}`}
                          className="gap-2"
                        >
                          {actionLoading === `cancel-${selectedBooking.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          Cancel (Faulty Receipt)
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Reschedule Dialog */}
        <Dialog open={rescheduleDialog} onOpenChange={setRescheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Propose Reschedule</DialogTitle>
              <DialogDescription>
                Send a reschedule request to the patient with a new time proposal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Reason for reschedule or propose new time..."
                  value={rescheduleNotes}
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => selectedBooking && handleReschedule(selectedBooking.id)}
                  disabled={actionLoading === `reschedule-${selectedBooking?.id}`}
                >
                  {actionLoading === `reschedule-${selectedBooking?.id}` ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Send Reschedule Request
                </Button>
                <Button variant="outline" onClick={() => setRescheduleDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DoctorLayout>
  );
}