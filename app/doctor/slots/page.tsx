"use client";

import { useState, useEffect } from "react";
import { getDay } from "date-fns";
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import { Slot, CreateSlotForm, SlotType } from "@/types";
import SlotForm from "@/components/doctor/SlotForm";
import { SlotsAPI } from "@/lib/api/slots";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DoctorSlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [showAddSlotDialog, setShowAddSlotDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [defaultPrice, setDefaultPrice] = useState<number>(3000);


  // Day names for display (Monday to Sunday)
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch slots and default pricing from API
  useEffect(() => {
    fetchSlots();
    fetchDefaultPrice();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedSlots = await SlotsAPI.getSlots();
      setSlots(fetchedSlots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weekly schedule');
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultPrice = async () => {
    try {
      const response = await fetch('/api/doctors/payment-settings', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.defaultPrice) {
          setDefaultPrice(result.data.defaultPrice);
        }
      }
    } catch (err) {
      console.error('Error fetching default price:', err);
      // Keep default value if fetch fails
    }
  };

  const getSlotsForDay = (dayOfWeek: number) => {
    return slots.filter(slot => slot.dayOfWeek === dayOfWeek && slot.isActive);
  };

  const getSlotTypeColor = (type: SlotType) => {
    switch (type) {
      case 'in_person':
        return 'bg-blue-100 text-blue-800';
      case 'video_call':
        return 'bg-green-100 text-green-800';
      case 'phone_call':
        return 'bg-purple-100 text-purple-800';
      case 'both':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSlotTypeIcon = (type: SlotType) => {
    switch (type) {
      case 'in_person':
        return <MapPin className="h-3 w-3" />;
      case 'video_call':
        return <Calendar className="h-3 w-3" />;
      case 'phone_call':
        return <Clock className="h-3 w-3" />;
      case 'both':
        return <MapPin className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const handleCreateSlot = async (data: CreateSlotForm) => {
    try {
      setActionLoading('create');
      setFormError(null); // Clear any previous form errors
      const newSlot = await SlotsAPI.createSlot(data);
      setSlots([...slots, newSlot]);
      setShowAddSlotDialog(false);
      setFormError(null); // Clear form error on success
    } catch (err) {
      // Don't close dialog on error so user can fix the issue
      const errorMessage = err instanceof Error ? err.message : 'Failed to create weekly slot';
      setFormError(errorMessage);
      
      // If it's a conflict error, keep the dialog open for user to fix
      console.error('Slot creation error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSlot = async (data: CreateSlotForm) => {
    if (!editingSlot) return;
    
    try {
      setActionLoading(`edit-${editingSlot.id}`);
      setFormError(null); // Clear any previous form errors
      const updatedSlot = await SlotsAPI.updateSlot(editingSlot.id, data);
      setSlots(slots.map(slot => slot.id === editingSlot.id ? updatedSlot : slot));
      setEditingSlot(null);
      setFormError(null); // Clear form error on success
    } catch (err) {
      // Don't close dialog on error so user can fix the issue
      const errorMessage = err instanceof Error ? err.message : 'Failed to update weekly slot';
      setFormError(errorMessage);
      
      // If it's a conflict error, keep the dialog open for user to fix
      console.error('Slot update error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this recurring weekly slot? This will remove it from all future weeks.')) {
      return;
    }
    
    try {
      setActionLoading(`delete-${slotId}`);
      await SlotsAPI.deleteSlot(slotId);
      setSlots(slots.filter(slot => slot.id !== slotId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete weekly slot');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DoctorLayout>
      <div className="container mx-auto py-8 space-y-8">
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

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Weekly Availability Schedule</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Set up your recurring weekly time slots. These will repeat automatically every week.
          </p>
          
          <Dialog open={showAddSlotDialog} onOpenChange={(open) => {
            setShowAddSlotDialog(open);
            if (open) setFormError(null); // Clear form error when opening
          }}>
            <DialogTrigger asChild>
              <Button 
                disabled={loading || actionLoading === 'create'}
                size="lg"
                className="gap-2"
              >
                {actionLoading === 'create' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Weekly Time Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Weekly Time Slot</DialogTitle>
                <DialogDescription>
                  This slot will repeat every week on the selected day
                </DialogDescription>
              </DialogHeader>
              <SlotForm
                onSubmit={handleCreateSlot}
                onCancel={() => setShowAddSlotDialog(false)}
                error={formError}
                defaultPrice={defaultPrice}
              />
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-20">
              <div className="text-center space-y-6">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <div className="space-y-2">
                  <p className="font-medium">Loading your schedule...</p>
                  <p className="text-sm text-muted-foreground">Please wait while we fetch your weekly availability</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Weekly Schedule Grid */}
            <div className="w-full overflow-x-auto">
              <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:flex xl:flex-row gap-4 min-w-full xl:min-w-max">
              {dayNames.map((dayName, dayIndex) => {
                // Convert Monday-first index to standard dayOfWeek (Monday=1, Sunday=0)
                const dayOfWeek = dayIndex === 6 ? 0 : dayIndex + 1;
                const daySlots = getSlotsForDay(dayOfWeek);
                const isToday = dayOfWeek === getDay(new Date());
                
                return (
                  <Card key={dayName} className={`flex-none xl:flex-1 xl:min-w-[180px] w-full shadow-sm hover:shadow-md transition-all duration-200 ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-center text-base font-semibold">
                        <div className="space-y-1">
                          {dayName}
                          {isToday && (
                            <Badge className="text-xs mt-1" variant="default">Today</Badge>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 px-4 pb-4 min-h-[200px]">
                      {daySlots.length === 0 ? (
                        <div className="text-center py-6 space-y-3">
                          <Clock className="h-10 w-10 mx-auto text-muted-foreground/30" />
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">No slots</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAddSlotDialog(true)}
                              className="gap-1 text-xs h-8"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {daySlots.map((slot) => (
                            <Card
                              key={slot.id}
                              className="p-3 space-y-2 cursor-pointer hover:bg-muted/30 transition-all duration-200"
                              onClick={() => setSelectedSlot(slot)}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="font-mono font-bold text-sm">{slot.startTime}</div>
                                  <Badge className={getSlotTypeColor(slot.type)} variant="secondary">
                                    {getSlotTypeIcon(slot.type)}
                                  </Badge>
                                </div>
                                
                                <div className="text-xs text-muted-foreground">
                                  {slot.duration} min • Rs. {Number(slot.price).toLocaleString('en-PK')}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-xs text-muted-foreground truncate">
                                  {slot.type === 'both' ? 'Both Online & Offline' : slot.type.replace('_', ' ')}
                                </span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingSlot(slot);
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSlot(slot.id);
                                    }}
                                    disabled={actionLoading === `delete-${slot.id}`}
                                    className="h-6 w-6 p-0"
                                  >
                                    {actionLoading === `delete-${slot.id}` ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            </div>

            {/* Empty State */}
            {slots.length === 0 && (
              <Card>
                <CardContent className="text-center py-24 space-y-10">
                  <div className="space-y-6">
                    <RotateCcw className="h-20 w-20 mx-auto text-muted-foreground/50" />
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold">No Weekly Schedule Set</h3>
                      <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                        Create your first recurring time slot to start accepting appointments
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowAddSlotDialog(true)}
                    size="lg"
                    className="gap-3 px-8 py-6 text-lg"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Slot
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Edit Slot Dialog */}
        {editingSlot && (
          <Dialog open={!!editingSlot} onOpenChange={(open) => {
            if (!open) {
              setEditingSlot(null);
              setFormError(null); // Clear form error when closing
            }
          }}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Time Slot</DialogTitle>
                <DialogDescription>
                  Update the details for this appointment slot
                </DialogDescription>
              </DialogHeader>
              <SlotForm
                onSubmit={handleEditSlot}
                onCancel={() => setEditingSlot(null)}
                initialData={editingSlot}
                isEditing={true}
                error={formError}
                defaultPrice={defaultPrice}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Slot Details Dialog */}
        {selectedSlot && (
          <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader className="pb-6">
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <Clock className="h-6 w-6" />
                  Slot Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Day</label>
                    <p className="font-bold text-lg">{dayNames[selectedSlot.dayOfWeek]}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Time</label>
                    <p className="font-bold text-lg font-mono">{selectedSlot.startTime}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Duration</label>
                    <p className="font-bold text-lg">{selectedSlot.duration} minutes</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Price</label>
                    <p className="font-bold text-lg">Rs. {Number(selectedSlot.price).toLocaleString('en-PK')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">Appointment Type</label>
                  <Badge className={`${getSlotTypeColor(selectedSlot.type)} gap-2 text-base py-2 px-4`}>
                    {getSlotTypeIcon(selectedSlot.type)}
                    {selectedSlot.type === 'both' ? 'Both Online & Offline' : selectedSlot.type.replace('_', ' ')}
                  </Badge>
                </div>

                {selectedSlot.address && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="p-4 rounded-lg border bg-muted/50 text-base">{selectedSlot.address}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={selectedSlot.isActive ? 'default' : 'secondary'} className="text-base py-2 px-4">
                    {selectedSlot.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    onClick={() => {
                      setSelectedSlot(null);
                      setEditingSlot(selectedSlot);
                    }}
                    className="flex-1 gap-2"
                    size="default"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Slot
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSlot(null)}
                    className="flex-1"
                    size="default"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DoctorLayout>
  );
}