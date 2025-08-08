import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ArrowLeft, FileText, Scale, CreditCard, UserCheck, AlertTriangle, Phone } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" size="sm" asChild className="transition-all duration-200 hover:scale-105">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">Zapix</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <Scale className="w-16 h-16 text-primary mx-auto" />
            <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-xl text-muted-foreground">
              Please read these terms carefully before using our services
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: January 1, 2025
            </p>
          </div>

          {/* Terms Sections */}
          <div className="grid gap-6">
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  By accessing and using Zapix (&quot;the Service&quot;), you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to these Terms of Service, you should 
                  not use the Service.
                </p>
                <p className="text-muted-foreground">
                  These terms apply to all users of the service, including doctors, patients, administrators, 
                  and any other healthcare providers who access or use the Service.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  Service Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Zapix provides:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>WhatsApp-based appointment booking system</li>
                    <li>Doctor dashboard for appointment management</li>
                    <li>Patient communication and record management</li>
                    <li>Payment processing integration</li>
                    <li>Document sharing and storage</li>
                    <li>Administrative tools for healthcare practices</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Important Notice:</h4>
                  <p className="text-muted-foreground">
                    Zapix is a technology platform that facilitates appointment booking and communication. 
                    We do not provide medical advice, diagnosis, or treatment. All medical decisions should 
                    be made in consultation with qualified healthcare professionals.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Subscription Plans:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>Basic Plan:</strong> ₨10,000/month - Up to 100 appointments</li>
                    <li><strong>Premium Plan:</strong> ₨15,000/month - Up to 500 appointments</li>
                    <li><strong>Enterprise Plan:</strong> Custom pricing for unlimited usage</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Payment Terms:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>All payments are billed monthly in advance</li>
                    <li>Payments are processed through secure payment gateways</li>
                    <li>Refunds are available within 7 days of subscription purchase</li>
                    <li>Late payments may result in service suspension</li>
                    <li>Prices may change with 30 days advance notice</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  User Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">All Users Must:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the confidentiality of their account credentials</li>
                    <li>Use the service in compliance with applicable laws</li>
                    <li>Respect the privacy and rights of other users</li>
                    <li>Report any security vulnerabilities or breaches</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Doctors Must:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Maintain valid medical licenses and certifications</li>
                    <li>Provide professional medical care according to standards</li>
                    <li>Protect patient confidentiality and privacy</li>
                    <li>Keep appointment schedules and availability updated</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  Prohibited Uses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">You may NOT use the Service to:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Violate any local, state, national, or international law</li>
                    <li>Share false, misleading, or fraudulent information</li>
                    <li>Impersonate another person or entity</li>
                    <li>Transmit spam, viruses, or malicious content</li>
                    <li>Attempt to gain unauthorized access to systems</li>
                    <li>Interfere with the proper working of the Service</li>
                    <li>Use the Service for any unlawful or prohibited purpose</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Zapix provides the Service &quot;as is&quot; without any warranties. We do not guarantee that the 
                  Service will be uninterrupted, secure, or error-free. Our liability is limited to the 
                  maximum extent permitted by law.
                </p>
                <div>
                  <h4 className="font-semibold mb-2">Medical Disclaimer:</h4>
                  <p className="text-muted-foreground">
                    The Service is not a substitute for professional medical advice, diagnosis, or treatment. 
                    Always seek the advice of qualified healthcare providers with any questions regarding 
                    medical conditions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Termination
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Account Termination:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>You may cancel your subscription at any time</li>
                    <li>We may suspend or terminate accounts for violations</li>
                    <li>Data backup and export options available before termination</li>
                    <li>Refunds processed according to our refund policy</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> <a href="mailto:zapix2025@gmail.com" className="text-primary hover:underline">zapix2025@gmail.com</a></p>
                  <p><strong>Phone:</strong> <a href="tel:+923012712507" className="text-primary hover:underline">+92 301 2712507</a></p>
                  <p><strong>WhatsApp:</strong> <a href="https://wa.me/923012712507" className="text-primary hover:underline">+92 301 2712507</a></p>
                  <p><strong>Address:</strong> Pakistan</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              These Terms of Service are effective as of January 1, 2025. We reserve the right to modify 
              these terms at any time. Changes will be posted on this page with an updated revision date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}