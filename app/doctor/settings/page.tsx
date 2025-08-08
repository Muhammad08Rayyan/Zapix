"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DoctorLayout from "@/components/doctor/DoctorLayout";

export default function DoctorSettingsPage() {
  return (
    <DoctorLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Account settings functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}