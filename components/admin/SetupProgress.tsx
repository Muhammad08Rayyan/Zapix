"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, CreditCard, Phone } from "lucide-react";
import { SetupProgress as SetupProgressType } from "@/types";

interface SetupProgressProps {
  setupProgress: SetupProgressType;
}

export default function SetupProgress({ setupProgress }: SetupProgressProps) {
  const totalItems = 2;
  const completedItems = Object.values(setupProgress).filter(Boolean).length;
  const progressPercentage = (completedItems / totalItems) * 100;
  
  // Hide the component if all items are complete
  if (completedItems === totalItems) {
    return null;
  }

  const setupItems = [
    {
      key: 'paymentSettings',
      label: 'Payment Settings',
      description: 'Configure your payment methods and pricing',
      icon: CreditCard,
      completed: setupProgress.paymentSettings
    },
    {
      key: 'businessNumber',
      label: 'Business Phone Number',
      description: 'Add your business contact number',
      icon: Phone,
      completed: setupProgress.businessNumber
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Setup Progress
        </CardTitle>
        <CardDescription>
          Complete these steps to fully activate your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Completion Progress</span>
            <span>{completedItems}/{totalItems} completed</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Setup Items */}
        <div className="space-y-4">
          {setupItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.key}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  item.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-muted border-border'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  item.completed 
                    ? 'bg-green-100' 
                    : 'bg-background'
                }`}>
                  {item.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.label}</span>
                    <Badge variant={item.completed ? "default" : "secondary"}>
                      {item.completed ? "Complete" : "Pending"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}