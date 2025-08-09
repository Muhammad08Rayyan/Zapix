"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Banknote, Smartphone, AlertCircle, CheckCircle2, DollarSign } from "lucide-react";
import DoctorLayout from "@/components/doctor/DoctorLayout";
import { PaymentDetails } from "@/types";

interface PaymentSettingsForm extends PaymentDetails {
  defaultPrice: number;
}

export default function PaymentSettingsPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<PaymentSettingsForm>({
    bankAccount: {
      accountNumber: "",
      bankName: "",
      accountTitle: ""
    },
    jazzCash: {
      phoneNumber: "",
      accountName: ""
    },
    easyPaisa: {
      phoneNumber: "",
      accountName: ""
    },
    defaultMethod: 'bank',
    defaultPrice: 3000
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/doctors/payment-settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment settings');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setFormData({
          ...formData,
          ...result.data.paymentDetails,
          defaultPrice: result.data.defaultPrice || 3000
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/doctors/payment-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save payment settings');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('Payment settings saved successfully');
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (section: keyof PaymentSettingsForm, field: string, value: string | number) => {
    if (section === 'defaultPrice') {
      setFormData(prev => ({ ...prev, defaultPrice: Number(value) }));
      return;
    }

    if (section === 'defaultMethod') {
      setFormData(prev => ({ ...prev, defaultMethod: value as 'bank' | 'jazzcash' | 'easypaisa' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    // Check if at least one payment method is configured
    const hasBankAccount = formData.bankAccount?.accountNumber && formData.bankAccount?.bankName && formData.bankAccount?.accountTitle;
    const hasJazzCash = formData.jazzCash?.phoneNumber && formData.jazzCash?.accountName;
    const hasEasyPaisa = formData.easyPaisa?.phoneNumber && formData.easyPaisa?.accountName;

    return hasBankAccount || hasJazzCash || hasEasyPaisa;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bank':
        return <CreditCard className="h-4 w-4" />;
      case 'jazzcash':
        return <Smartphone className="h-4 w-4" />;
      case 'easypaisa':
        return <Banknote className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'bank':
        return 'Bank Transfer';
      case 'jazzcash':
        return 'JazzCash';
      case 'easypaisa':
        return 'EasyPaisa';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="py-20">
              <div className="text-center space-y-6">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <div className="space-y-2">
                  <p className="font-medium">Loading payment settings...</p>
                  <p className="text-sm text-muted-foreground">Please wait while we fetch your payment configuration</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Payment Settings</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Configure your payment methods and default pricing. Patients will see these details when booking appointments.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Default Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Default Pricing
              </CardTitle>
              <CardDescription>
                Set your default consultation fee. You can override this for specific appointment slots.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultPrice">Default Consultation Fee (PKR)</Label>
                <Input
                  id="defaultPrice"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="3000"
                  value={formData.defaultPrice}
                  onChange={(e) => updateField('defaultPrice', '', e.target.value)}
                  className="text-lg font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  This will be the default price for new appointment slots
                </p>
              </div>

              {formData.defaultPrice > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold">Rs. {Number(formData.defaultPrice).toLocaleString('en-PK')}</p>
                    <p className="text-sm text-muted-foreground">Default consultation fee</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Default Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Preferred Payment Method
              </CardTitle>
              <CardDescription>
                Choose which payment method to show first to patients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultMethod">Preferred Method</Label>
                <Select 
                  value={formData.defaultMethod} 
                  onValueChange={(value) => updateField('defaultMethod', '', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value="jazzcash">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        JazzCash
                      </div>
                    </SelectItem>
                    <SelectItem value="easypaisa">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        EasyPaisa
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  {getMethodIcon(formData.defaultMethod)}
                  <Badge variant="default">
                    Preferred: {getMethodName(formData.defaultMethod)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Payment Methods</h2>
            <p className="text-muted-foreground">
              Configure your payment details that patients will use to send payments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Bank Account */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Bank Transfer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="e.g. HBL, UBL, MCB"
                    value={formData.bankAccount?.bankName || ''}
                    onChange={(e) => updateField('bankAccount', 'bankName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountTitle">Account Title</Label>
                  <Input
                    id="accountTitle"
                    placeholder="Account holder name"
                    value={formData.bankAccount?.accountTitle || ''}
                    onChange={(e) => updateField('bankAccount', 'accountTitle', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="1234567890123456"
                    value={formData.bankAccount?.accountNumber || ''}
                    onChange={(e) => updateField('bankAccount', 'accountNumber', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* JazzCash */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  JazzCash
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jazzCashName">Account Name</Label>
                  <Input
                    id="jazzCashName"
                    placeholder="Account holder name"
                    value={formData.jazzCash?.accountName || ''}
                    onChange={(e) => updateField('jazzCash', 'accountName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jazzCashPhone">Phone Number</Label>
                  <Input
                    id="jazzCashPhone"
                    placeholder="+92 300 1234567"
                    value={formData.jazzCash?.phoneNumber || ''}
                    onChange={(e) => updateField('jazzCash', 'phoneNumber', e.target.value)}
                  />
                </div>

                <div className="pt-4">
                  <p className="text-xs text-muted-foreground">
                    Patients will send money to this JazzCash account
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* EasyPaisa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  EasyPaisa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="easyPaisaName">Account Name</Label>
                  <Input
                    id="easyPaisaName"
                    placeholder="Account holder name"
                    value={formData.easyPaisa?.accountName || ''}
                    onChange={(e) => updateField('easyPaisa', 'accountName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="easyPaisaPhone">Phone Number</Label>
                  <Input
                    id="easyPaisaPhone"
                    placeholder="+92 300 1234567"
                    value={formData.easyPaisa?.phoneNumber || ''}
                    onChange={(e) => updateField('easyPaisa', 'phoneNumber', e.target.value)}
                  />
                </div>

                <div className="pt-4">
                  <p className="text-xs text-muted-foreground">
                    Patients will send money to this EasyPaisa account
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleSave}
            disabled={saving || !validateForm()}
            size="lg"
            className="min-w-[200px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Payment Settings'
            )}
          </Button>
        </div>

        {!validateForm() && (
          <div className="text-center">
            <Alert variant="destructive" className="max-w-md mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please configure at least one payment method before saving.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}