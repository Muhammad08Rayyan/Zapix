"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DoctorLayout from "@/components/doctor/DoctorLayout";

export default function DoctorBillingPage() {
  return (
    <DoctorLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Billing & Payments</CardTitle>
            <CardDescription>
              Manage payments, invoices, and financial records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Billing management functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}