"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DoctorLayout from "@/components/doctor/DoctorLayout";

export default function DoctorSlotsPage() {
  return (
    <DoctorLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Availability Management</CardTitle>
            <CardDescription>
              Create and manage your appointment time slots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Slots management functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}