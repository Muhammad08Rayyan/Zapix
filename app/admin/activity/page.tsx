"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminActivityPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>
              View system logs and activity tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">System activity monitoring functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}