"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DoctorLayout from "@/components/doctor/DoctorLayout";

export default function DoctorMessagesPage() {
  return (
    <DoctorLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Messages</CardTitle>
            <CardDescription>
              View and manage WhatsApp communications with patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">WhatsApp messages functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}