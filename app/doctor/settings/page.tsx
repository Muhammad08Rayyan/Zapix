"use client";

import { useState, useEffect } from "react";
import { Save, Bell, Calendar, Clock, Phone, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ValidatedNumberInput } from "@/components/ui/validated-number-input";
import { PhoneInputComponent } from "@/components/ui/phone-input";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import { DoctorLimits, NotificationSettings, DoctorPlan } from "@/types";
import { getPlanConfig, canDoctorCustomizeSettings } from "@/lib/plan-config";

interface DoctorSettings {
  limits: DoctorLimits;
  personalPhone: string;
  businessPhone: string;
  notificationSettings: NotificationSettings;
  plan: DoctorPlan;
}

export default function DoctorSettingsPage() {
  const [settings, setSettings] = useState<DoctorSettings>({
    limits: {
      maxAppointmentsPerDay: 10,
      maxReschedules: 2,
      advanceBookingDays: 30,
      cancellationHours: 24
    },
    personalPhone: "",
    businessPhone: "",
    notificationSettings: {
      appointmentReminders: false,
      bookingNotifications: false,
      emergencyAlerts: false
    },
    plan: 'none'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/doctors/settings');
      const result = await response.json();
      
      if (result.success) {
        const settingsData = result.data;
        // Force notification settings to false for essential plan
        if (settingsData.plan === 'essential') {
          settingsData.notificationSettings = {
            appointmentReminders: false,
            bookingNotifications: false,
            emergencyAlerts: false
          };
        }
        setSettings(prev => ({
          ...prev,
          ...settingsData
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      // Prepare settings data for saving
      const settingsToSave = { ...settings };
      
      // Force notification settings to false for essential plan
      if (settings.plan === 'essential') {
        settingsToSave.notificationSettings = {
          appointmentReminders: false,
          bookingNotifications: false,
          emergencyAlerts: false
        };
      }
      
      const response = await fetch('/api/doctors/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsToSave)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setSettings(prev => ({
          ...prev,
          ...result.data
        }));
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const updateLimits = (key: keyof DoctorLimits, value: number) => {
    // Only allow updates if the doctor can customize settings
    if (canDoctorCustomizeSettings(settings.plan)) {
      setSettings(prev => ({
        ...prev,
        limits: {
          ...prev.limits,
          [key]: value || 0
        }
      }));
    }
  };

  const updateNotification = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="text-muted-foreground">Loading settings...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DoctorLayout>
    );
  }

  const planConfig = getPlanConfig(settings.plan);
  const canCustomize = canDoctorCustomizeSettings(settings.plan);
  const isInactive = settings.plan === 'none';
  const isEssentialPlan = settings.plan === 'essential';
  
  // Essential plan doctors can save phone number changes
  const canSaveSettings = canCustomize || isEssentialPlan;

  return (
    <DoctorLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings & Preferences</h1>
            <p className="text-muted-foreground">
              Configure your appointment limits, notification preferences, and contact information
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Plan Information */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                {isInactive ? (
                  <>
                    <h3 className="font-semibold text-lg text-amber-600">Account Inactive</h3>
                    <p className="text-sm text-muted-foreground">No plan assigned - contact admin to activate your account</p>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-lg">{planConfig?.displayName} Plan</h3>
                    <p className="text-sm text-muted-foreground">{planConfig?.description}</p>
                  </>
                )}
              </div>
              <div className="text-right">
                {isInactive ? (
                  <p className="text-sm text-amber-600 font-medium">Please wait for admin approval</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {canCustomize ? 'Full customization available' : 'Settings managed by your plan'}
                    </p>
                    {!canCustomize && (
                      <p className="text-xs text-amber-600">Contact admin to upgrade for custom settings</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Messages */}
        {message && (
          <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Appointment Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Appointment Limits</span>
              {!canCustomize && (
                <Badge variant="outline" className="text-xs">Plan Default</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {canCustomize 
                ? "Configure the booking limits for your practice" 
                : "These limits are set by your plan and cannot be modified"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxAppointments" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Maximum Appointments Per Day</span>
                </Label>
                <ValidatedNumberInput
                  id="maxAppointments"
                  value={settings.limits.maxAppointmentsPerDay}
                  onChange={(value) => updateLimits('maxAppointmentsPerDay', value)}
                  min={1}
                  max={50}
                  placeholder="10"
                  disabled={!canCustomize}
                />
                <p className="text-xs text-muted-foreground">
                  {settings.limits.maxAppointmentsPerDay === 999 
                    ? 'Unlimited appointments per day' 
                    : 'Maximum number of appointments you can accept per day'}
                  {!canCustomize && ' (set by your plan)'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxReschedules">Maximum Reschedules</Label>
                <ValidatedNumberInput
                  id="maxReschedules"
                  value={settings.limits.maxReschedules}
                  onChange={(value) => updateLimits('maxReschedules', value)}
                  min={0}
                  max={10}
                  placeholder="2"
                  disabled={!canCustomize}
                />
                <p className="text-xs text-muted-foreground">
                  How many times a patient can reschedule the same appointment
                  {!canCustomize && ' (set by your plan)'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="advanceBooking" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Advance Booking Days</span>
                </Label>
                <ValidatedNumberInput
                  id="advanceBooking"
                  value={settings.limits.advanceBookingDays}
                  onChange={(value) => updateLimits('advanceBookingDays', value)}
                  min={1}
                  max={365}
                  placeholder="30"
                  disabled={!canCustomize}
                />
                <p className="text-xs text-muted-foreground">
                  How many days in advance patients can book appointments
                  {!canCustomize && ' (set by your plan)'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellationHours" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Cancellation Notice (Hours)</span>
                </Label>
                <ValidatedNumberInput
                  id="cancellationHours"
                  value={settings.limits.cancellationHours}
                  onChange={(value) => updateLimits('cancellationHours', value)}
                  min={1}
                  max={168}
                  placeholder="24"
                  disabled={!canCustomize}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum notice required for appointment cancellations
                  {!canCustomize && ' (set by your plan)'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
            <CardDescription>
              Set your personal and business contact numbers with strict validation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="personalPhone" className="text-sm font-medium">
                Personal Phone Number <span className="text-red-500">*</span>
              </Label>
              <PhoneInputComponent
                id="personalPhone"
                value={settings.personalPhone}
                onChange={(value) => setSettings(prev => ({ ...prev, personalPhone: value || "" }))}
                placeholder="Enter your personal phone number"
                required={true}
                showValidation={true}
              />
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-1">Examples of valid formats:</p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Pakistan: +92 300 1234567</li>
                  <li>• Pakistan: +92 21 12345678 (landline)</li>
                  <li>• USA: +1 555 123 4567</li>
                  <li>• UK: +44 20 1234 5678</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                This number will be used for important notifications and emergency alerts
              </p>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="businessPhone" className="text-sm font-medium">
                Business Phone Number <span className="text-red-500">*</span>
              </Label>
              <PhoneInputComponent
                id="businessPhone"
                value={settings.businessPhone}
                onChange={(value) => setSettings(prev => ({ ...prev, businessPhone: value || "" }))}
                placeholder="Enter your business phone number"
                required={true}
                showValidation={true}
              />
              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-800 dark:text-green-200 font-medium mb-1">Business number guidelines:</p>
                <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                  <li>• Use clinic/hospital main number</li>
                  <li>• Ensure number is always available during business hours</li>
                  <li>• Patients will see this number for booking inquiries</li>
                  <li>• Example: +92 21 12345678</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                This number will be displayed to patients for business inquiries and booking confirmations
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notification Preferences</span>
              {isEssentialPlan && (
                <Badge variant="outline" className="text-xs">Essential Plan</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isEssentialPlan 
                ? "Notification preferences are disabled on Essential plan - upgrade to customize" 
                : "Choose which notifications you want to receive"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">Appointment Reminders</div>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders before upcoming appointments
                  </p>
                </div>
                <Switch
                  checked={settings.notificationSettings.appointmentReminders}
                  onCheckedChange={(checked) => updateNotification('appointmentReminders', checked)}
                  disabled={isEssentialPlan}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">Booking Notifications</div>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new appointments are booked or cancelled
                  </p>
                </div>
                <Switch
                  checked={settings.notificationSettings.bookingNotifications}
                  onCheckedChange={(checked) => updateNotification('bookingNotifications', checked)}
                  disabled={isEssentialPlan}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">Emergency Alerts</div>
                  <p className="text-sm text-muted-foreground">
                    Receive urgent notifications for critical issues
                  </p>
                </div>
                <Switch
                  checked={settings.notificationSettings.emergencyAlerts}
                  onCheckedChange={(checked) => updateNotification('emergencyAlerts', checked)}
                  disabled={isEssentialPlan}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving || !canSaveSettings || isInactive} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : isInactive ? 'Account Inactive' : (canCustomize ? 'Save All Changes' : isEssentialPlan ? 'Save Phone Numbers' : 'Settings Managed by Plan')}
          </Button>
        </div>
      </div>
    </DoctorLayout>
  );
}