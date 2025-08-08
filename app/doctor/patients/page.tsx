"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DoctorLayout from "@/components/doctor/DoctorLayout";

export default function DoctorPatientsPage() {
  return (
    <DoctorLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>
              Manage patient information and medical records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Patient records functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}