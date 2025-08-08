"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminMessagesPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <Card className="">
          <CardHeader>
            <CardTitle className="">WhatsApp Messages</CardTitle>
            <CardDescription className="">
              Monitor WhatsApp communications and bot interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">WhatsApp messages management functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}