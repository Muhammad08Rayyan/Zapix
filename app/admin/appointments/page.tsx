"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminAppointmentsPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <Card className="">
          <CardHeader>
            <CardTitle className="">Appointments Overview</CardTitle>
            <CardDescription className="">
              Monitor system-wide appointment bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Appointments management functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}