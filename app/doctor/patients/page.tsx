"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, User, Calendar, FileText, Upload, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import { Patient } from "@/types";

interface PatientWithBookings {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  medicalHistory: string[];
  doctorId: string;
  privateNotes?: string;
  documents?: string[];
  createdAt: Date;
  updatedAt: Date;
  appointments?: {
    id: string;
    date: string;
    time: string;
    status: string;
    type: string;
    symptoms?: string;
    notes?: string;
    documents?: string[];
    rescheduleCount?: number;
  }[];
  upcomingAppointments?: {
    id: string;
    date: string;
    time: string;
    status: string;
    type: string;
    rescheduleCount?: number;
  }[];
  totalDocuments?: number;
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithBookings | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingHistory, setEditingHistory] = useState<string[]>([]);

  const fetchPatients = useCallback(async () => {
    try {
      const response = await fetch(`/api/patients?search=${encodeURIComponent(searchTerm)}`);
      const result = await response.json();
      
      if (result.success) {
        setPatients(result.data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchPatients();
  }, [searchTerm, fetchPatients]);

  const fetchPatientDetails = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      const result = await response.json();
      
      if (result.success) {
        setSelectedPatient(result.data.patient);
        setEditingNotes(result.data.patient.privateNotes || "");
        setEditingHistory(result.data.patient.medicalHistory || []);
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
  };

  const updatePatientNotes = async () => {
    if (!selectedPatient) return;
    
    try {
      const response = await fetch(`/api/patients/${selectedPatient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          privateNotes: editingNotes,
          medicalHistory: editingHistory
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setSelectedPatient({ ...selectedPatient, privateNotes: editingNotes, medicalHistory: editingHistory });
        setIsEditing(false);
        // Update the patient in the list
        setPatients(patients.map(p => 
          p.id === selectedPatient.id 
            ? { ...p, privateNotes: editingNotes, medicalHistory: editingHistory }
            : p
        ));
      }
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const addMedicalHistoryItem = () => {
    setEditingHistory([...editingHistory, ""]);
  };

  const updateMedicalHistoryItem = (index: number, value: string) => {
    const newHistory = [...editingHistory];
    newHistory[index] = value;
    setEditingHistory(newHistory);
  };

  const removeMedicalHistoryItem = (index: number) => {
    setEditingHistory(editingHistory.filter((_, i) => i !== index));
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="text-muted-foreground">Loading patients...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Patient Records (EMR)</CardTitle>
            <CardDescription>
              Search and manage patient information, medical records, and appointment history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name, phone, or Patient ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Search by name, phone number, or Patient ID (e.g., PT001)
              </p>
            </div>

            {/* Patient List */}
            <div className="grid gap-4">
              {patients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No patients found matching your search." : "No patients registered yet."}
                </div>
              ) : (
                patients.map((patient) => (
                  <Card key={patient.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary/10 rounded-full p-2">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{patient.name}</h3>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>Patient ID: {patient.patientId || 'N/A'}</div>
                              <div>Age: {patient.age} • {patient.gender}</div>
                              <div>Phone: {patient.phone}</div>
                              {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {patient.medicalHistory.slice(0, 2).map((condition, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {condition}
                                    </Badge>
                                  ))}
                                  {patient.medicalHistory.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{patient.medicalHistory.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => fetchPatientDetails(patient.id)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <User className="h-5 w-5" />
                                <span>{selectedPatient?.name}</span>
                              </DialogTitle>
                              <DialogDescription>
                                Patient medical records and appointment history
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedPatient && (
                              <ScrollArea className="h-[70vh] pr-4">
                                <div className="space-y-6">
                                  {/* Patient Info */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Patient ID</label>
                                      <p className="text-sm text-muted-foreground font-mono font-bold">
                                        {selectedPatient.patientId || 'N/A'}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Age</label>
                                      <p className="text-sm text-muted-foreground">{selectedPatient.age}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Gender</label>
                                      <p className="text-sm text-muted-foreground capitalize">{selectedPatient.gender}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Phone</label>
                                      <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Patient Since</label>
                                      <p className="text-sm text-muted-foreground">{formatDate(selectedPatient.createdAt)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Search Hint</label>
                                      <p className="text-xs text-muted-foreground">
                                        Patients can use &quot;{selectedPatient.patientId}&quot; to restore their profile
                                      </p>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Medical History */}
                                  <div>
                                    <div className="flex items-center justify-between mb-3">
                                      <h3 className="font-semibold">Medical History</h3>
                                      {isEditing && (
                                        <Button size="sm" variant="outline" onClick={addMedicalHistoryItem}>
                                          Add Condition
                                        </Button>
                                      )}
                                    </div>
                                    {isEditing ? (
                                      <div className="space-y-2">
                                        {editingHistory.map((condition, idx) => (
                                          <div key={idx} className="flex items-center space-x-2">
                                            <Input
                                              value={condition}
                                              onChange={(e) => updateMedicalHistoryItem(idx, e.target.value)}
                                              placeholder="Medical condition"
                                            />
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => removeMedicalHistoryItem(idx)}
                                            >
                                              Remove
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="flex flex-wrap gap-2">
                                        {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                                          selectedPatient.medicalHistory.map((condition, idx) => (
                                            <Badge key={idx} variant="secondary">
                                              {condition}
                                            </Badge>
                                          ))
                                        ) : (
                                          <p className="text-sm text-muted-foreground">No medical history recorded</p>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <Separator />

                                  {/* Private Notes */}
                                  <div>
                                    <div className="flex items-center justify-between mb-3">
                                      <h3 className="font-semibold flex items-center space-x-2">
                                        <FileText className="h-4 w-4" />
                                        <span>Private Notes</span>
                                      </h3>
                                      <div className="space-x-2">
                                        {isEditing ? (
                                          <>
                                            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                                              Cancel
                                            </Button>
                                            <Button size="sm" onClick={updatePatientNotes}>
                                              Save Changes
                                            </Button>
                                          </>
                                        ) : (
                                          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                    {isEditing ? (
                                      <Textarea
                                        value={editingNotes}
                                        onChange={(e) => setEditingNotes(e.target.value)}
                                        placeholder="Add private notes about this patient..."
                                        rows={4}
                                      />
                                    ) : (
                                      <div className="min-h-[100px] p-3 border rounded bg-muted/50">
                                        {selectedPatient.privateNotes ? (
                                          <p className="text-sm whitespace-pre-wrap">{selectedPatient.privateNotes}</p>
                                        ) : (
                                          <p className="text-sm text-muted-foreground">No private notes added yet</p>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <Separator />

                                  {/* Documents */}
                                  <div>
                                    <div className="flex items-center justify-between mb-3">
                                      <h3 className="font-semibold">Documents</h3>
                                      <Button size="sm" variant="outline">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Document
                                      </Button>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Document upload functionality will be available soon.
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Upcoming Appointments */}
                                  <div>
                                    <h3 className="font-semibold mb-3 flex items-center space-x-2">
                                      <Calendar className="h-4 w-4" />
                                      <span>Upcoming Appointments</span>
                                    </h3>
                                    <div className="space-y-3">
                                      {selectedPatient.upcomingAppointments && selectedPatient.upcomingAppointments.length > 0 ? (
                                        selectedPatient.upcomingAppointments.map((appointment, idx: number) => (
                                          <Card key={idx} className="border-l-4 border-l-blue-500">
                                            <CardContent className="p-4">
                                              <div className="flex items-center justify-between mb-2">
                                                <div className="font-medium">
                                                  {formatDate(appointment.date)} at {appointment.time}
                                                </div>
                                                <Badge className={getStatusColor(appointment.status)}>
                                                  {appointment.status}
                                                </Badge>
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                Type: {appointment.type === 'both' ? 'Both Online & Offline' : appointment.type?.replace('_', ' ')}
                                              </div>
                                              {appointment.rescheduleCount && (
                                                <div className="text-xs text-orange-600 mt-1">
                                                  Rescheduled {appointment.rescheduleCount} time(s)
                                                </div>
                                              )}
                                            </CardContent>
                                          </Card>
                                        ))
                                      ) : (
                                        <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                                      )}
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Complete Appointment History */}
                                  <div>
                                    <h3 className="font-semibold mb-3 flex items-center space-x-2">
                                      <Calendar className="h-4 w-4" />
                                      <span>Complete Appointment History</span>
                                    </h3>
                                    <div className="space-y-3">
                                      {selectedPatient.appointments && selectedPatient.appointments.length > 0 ? (
                                        selectedPatient.appointments.map((appointment, idx: number) => (
                                          <Card key={idx} className="border-l-4 border-l-gray-300">
                                            <CardContent className="p-4">
                                              <div className="flex items-center justify-between mb-2">
                                                <div className="font-medium">
                                                  {formatDate(appointment.date)} at {appointment.time}
                                                </div>
                                                <Badge className={getStatusColor(appointment.status)}>
                                                  {appointment.status}
                                                </Badge>
                                              </div>
                                              
                                              <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-muted-foreground">
                                                <div>
                                                  <strong>Type:</strong> {appointment.type === 'both' ? 'Both Online & Offline' : appointment.type?.replace('_', ' ')}
                                                </div>
                                                {appointment.rescheduleCount && (
                                                  <div>
                                                    <strong>Reschedules:</strong> {appointment.rescheduleCount}
                                                  </div>
                                                )}
                                              </div>

                                              {appointment.symptoms && (
                                                <div className="text-sm text-muted-foreground mb-2">
                                                  <strong>Symptoms:</strong> {appointment.symptoms}
                                                </div>
                                              )}
                                              
                                              {appointment.notes && (
                                                <div className="text-sm text-muted-foreground mb-2">
                                                  <strong>Doctor Notes:</strong> {appointment.notes}
                                                </div>
                                              )}

                                              {appointment.documents && appointment.documents.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                  {appointment.documents.map((doc, docIdx) => (
                                                    <Button
                                                      key={docIdx}
                                                      variant="outline"
                                                      size="sm"
                                                      className="gap-1"
                                                    >
                                                      <FileText className="h-3 w-3" />
                                                      Document {docIdx + 1}
                                                    </Button>
                                                  ))}
                                                </div>
                                              )}
                                            </CardContent>
                                          </Card>
                                        ))
                                      ) : (
                                        <p className="text-sm text-muted-foreground">No appointment history found</p>
                                      )}
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* All Documents Summary */}
                                  <div>
                                    <h3 className="font-semibold mb-3 flex items-center space-x-2">
                                      <FileText className="h-4 w-4" />
                                      <span>All Documents</span>
                                    </h3>
                                    <div className="p-4 bg-muted rounded-lg">
                                      <p className="text-sm text-muted-foreground">
                                        Total documents across all appointments: <strong>{selectedPatient.totalDocuments || 0}</strong>
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Documents are organized by appointment above. Use the document buttons to view individual files.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </ScrollArea>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}