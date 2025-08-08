"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DoctorLayout from "@/components/doctor/DoctorLayout";

export default function DoctorAppointmentsPage() {
  return (
    <DoctorLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Appointments Management</CardTitle>
            <CardDescription>
              View and manage your appointment bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Appointments management functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}