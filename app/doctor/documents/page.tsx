"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DoctorLayout from "@/components/doctor/DoctorLayout";

export default function DoctorDocumentsPage() {
  return (
    <DoctorLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Documents & Files</CardTitle>
            <CardDescription>
              Manage patient documents and medical files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Documents management functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}