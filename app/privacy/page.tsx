import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ArrowLeft, Shield, Eye, Lock, Database, Users, Phone } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
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
            <Shield className="w-16 h-16 text-primary mx-auto" />
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-xl text-muted-foreground">
              Your privacy and data security are our top priorities
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: January 1, 2025
            </p>
          </div>

          {/* Privacy Sections */}
          <div className="grid gap-6">
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Personal Information</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Name, email address, and phone number</li>
                    <li>Medical history and appointment details (for patients)</li>
                    <li>Professional credentials (for doctors)</li>
                    <li>Payment information for subscription billing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">WhatsApp Communication</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Messages exchanged through our WhatsApp integration</li>
                    <li>Document uploads and medical records shared</li>
                    <li>Appointment booking conversations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Facilitate appointment booking and management</li>
                  <li>Enable secure communication between patients and doctors</li>
                  <li>Process payments and maintain billing records</li>
                  <li>Provide customer support and technical assistance</li>
                  <li>Improve our services and develop new features</li>
                  <li>Comply with healthcare regulations and legal requirements</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Data Security & Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Security Measures</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>End-to-end encryption for all communications</li>
                    <li>Secure cloud storage with regular backups</li>
                    <li>Multi-factor authentication for admin access</li>
                    <li>Regular security audits and vulnerability assessments</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">HIPAA Compliance</h4>
                  <p className="text-muted-foreground">
                    We maintain strict compliance with healthcare privacy regulations to ensure 
                    your medical information remains confidential and secure.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Information Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">We DO NOT share your information except:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Between patients and their assigned doctors for medical care</li>
                    <li>With payment processors for billing purposes</li>
                    <li>When required by law or court order</li>
                    <li>With your explicit consent</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Third-Party Services</h4>
                  <p className="text-muted-foreground">
                    We use trusted service providers for WhatsApp API, cloud storage, and payment processing. 
                    All partners are required to maintain strict data protection standards.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Your Rights & Choices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">You have the right to:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your account and data</li>
                    <li>Export your data in a portable format</li>
                    <li>Opt-out of non-essential communications</li>
                    <li>Withdraw consent for data processing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about this Privacy Policy or how we handle your data, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> <a href="mailto:zapix2025@gmail.com" className="text-primary hover:underline">zapix2025@gmail.com</a></p>
                  <p><strong>Phone:</strong> <a href="tel:+923012712507" className="text-primary hover:underline">+92 301 2712507</a></p>
                  <p><strong>WhatsApp:</strong> <a href="https://wa.me/923012712507" className="text-primary hover:underline">+92 301 2712507</a></p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              This Privacy Policy is effective as of January 1, 2025. We may update this policy from time to time, 
              and we will notify you of any significant changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}