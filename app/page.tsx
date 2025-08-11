"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Calendar, Users, MessageSquare, Zap, Mail, Send, Sun, Moon, ShieldCheck, Sparkles } from "lucide-react";
import { FeaturesSectionWithHoverEffects } from "@/components/feature-section-with-hover-effects";
import { PricingSection } from "@/components/pricing-section";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { SearchParamsHandler } from "@/components/search-params-handler";

export default function HomePage() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ email: "", phone: "", message: "" });
        alert("Message sent successfully! We'll get back to you within 24 hours.");
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert("Failed to send message. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!mounted) {
    return null;
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Suspense fallback={null}>
        <SearchParamsHandler mounted={mounted} />
      </Suspense>
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="flex items-center space-x-2 group cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">Zapix</span>
          </button>
          <nav className="hidden md:flex space-x-6">
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 relative group cursor-pointer"
            >
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </button>
            <button 
              onClick={() => scrollToSection('pricing')} 
              className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 relative group cursor-pointer"
            >
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 relative group cursor-pointer"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </button>
          </nav>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="transition-all duration-200 hover:scale-105"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            <Button variant="outline" asChild className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <Link href={session?.user?.role === "doctor" ? "/doctor" : "/login"}>
                {session?.user?.role === "doctor" ? "Dashboard" : "Login"}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120vw] h-[120vw] rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-24 md:py-28">
          <div className="grid items-center gap-10 md:grid-cols-2">
            {/* copy */}
            <div>
              <Badge variant="secondary" className="mb-4 inline-flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-primary" /> New in 2025
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Transform Patient Care
                <br />
                <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary/80 bg-clip-text text-transparent">Through WhatsApp</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Automate appointments, payments, and patient communication through WhatsApp Business. Reduce no-shows by 80% and save 5+ hours daily.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" onClick={() => scrollToSection('features')} className="transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
                  See Features
                </Button>
                <Button size="lg" variant="outline" asChild className="transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
                  <Link href={session?.user?.role === "doctor" ? "/doctor" : "/login"}>
                    {session?.user?.role === "doctor" ? "Go to Dashboard" : "Try It Out"}
                  </Link>
                </Button>
              </div>

              {/* trust bar */}
              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> HIPAA Compliant
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" /> 500+ Doctors Trust Us
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" /> WhatsApp Business Verified
                </div>
              </div>
            </div>

            {/* visual (hidden on mobile) */}
            <div className="relative hidden md:block">
              {/* floating glow */}
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 blur-2xl" />
              {/* phone mockup */}
              <div className="relative mx-auto w-full max-w-sm rounded-[2rem] border bg-background shadow-xl">
                <div className="h-6 flex items-center justify-center text-xs text-muted-foreground">WhatsApp Chat</div>
                <div className="border-t">
                  <div className="p-4 space-y-3 max-h-[22rem] overflow-hidden">
                    <div className="w-9/12 rounded-2xl bg-muted p-3 animate-[fadeIn_0.6s_ease-out_forwards]">
                      Hi Dr. Ahmed! Need to book urgently
                    </div>
                    <div className="w-10/12 rounded-2xl bg-primary text-primary-foreground ml-auto p-3 animate-[fadeIn_0.6s_ease-out_0.1s_forwards]">
                      Hello! I can help you book instantly. What&apos;s your preferred time?
                    </div>
                    <div className="w-7/12 rounded-2xl bg-muted p-3 animate-[fadeIn_0.6s_ease-out_0.2s_forwards]">
                      Tomorrow 3 PM?
                    </div>
                    <div className="w-11/12 rounded-2xl bg-primary text-primary-foreground ml-auto p-3 animate-[fadeIn_0.6s_ease-out_0.3s_forwards]">
                      Perfect! ₨2,000 consultation. Pay via JazzCash?
                    </div>
                    <div className="w-8/12 rounded-2xl bg-muted p-3 animate-[fadeIn_0.6s_ease-out_0.4s_forwards]">
                      Yes, sending payment
                    </div>
                    <div className="w-11/12 rounded-2xl bg-primary text-primary-foreground ml-auto p-3 animate-[fadeIn_0.6s_ease-out_0.5s_forwards]">
                      Booked! Reminder sent. See you tomorrow at 3 PM ✅
                    </div>
                  </div>
                </div>
              </div>

              {/* floating badges */}
              {/* position safely within container on small screens, allow wider on large */}
              <div className="absolute right-2 top-2 lg:-right-6 lg:-top-6 flex flex-col gap-3">
                <div className="rounded-full bg-background border shadow-md px-3 py-1 text-xs flex items-center gap-2 animate-[floatY_4s_ease-in-out_infinite]">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Auto-scheduling
                </div>
                <div className="rounded-full bg-background border shadow-md px-3 py-1 text-xs flex items-center gap-2 animate-[floatY_5s_ease-in-out_infinite]">
                  <Users className="h-3.5 w-3.5 text-primary" /> EMR-ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transform Your Medical Practice</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive WhatsApp automation that handles everything from appointments to payments, letting you focus on what matters most - your patients.
            </p>
          </div>
          <FeaturesSectionWithHoverEffects />
        </div>
      </section>

      <PricingSection onButtonClick={() => scrollToSection('contact')} />

      {/* How it Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">From Chaos to Calm in 3 Steps</h2>
            <p className="text-xl text-muted-foreground">Go from overwhelmed to organized in just 15 minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Patient Texts You", description: "Your patients contact your existing WhatsApp Business number as they always do" },
              { step: "2", title: "Zapix Takes Over", description: "Our AI bot instantly books appointments, collects payments, and sends confirmations" },
              { step: "3", title: "You Focus on Care", description: "Review appointments in your dashboard while the bot handles reminders and follow-ups" }
            ].map((item, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                  <span className="text-2xl font-bold text-primary-foreground">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-200">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Practice?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get your WhatsApp bot setup in 24 hours. We&apos;ll connect it to your existing WhatsApp Business number.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="transition-all duration-300 hover:shadow-lg group cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2 transition-transform group-hover:scale-110 duration-200" />
                  <h3 className="font-semibold mb-1">WhatsApp</h3>
                  <p className="text-muted-foreground">+92 301 2712507</p>
                </CardContent>
              </Card>
              
              <Card className="transition-all duration-300 hover:shadow-lg group cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <Mail className="w-8 h-8 text-primary mx-auto mb-2 transition-transform group-hover:scale-110 duration-200" />
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-muted-foreground">zapix2025@gmail.com</p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <CardTitle>Get Your WhatsApp Bot Setup</CardTitle>
                  <CardDescription>We&apos;ll set up your appointment bot within 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+92 300 1234567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your practice size, patient volume, and your WhatsApp Business number if you have one..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={4}
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="flex items-center space-x-2 mb-4 md:mb-0 group cursor-pointer focus:outline-none"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-primary">Zapix</span>
            </button>
            
            <div className="text-center text-sm text-muted-foreground mb-4 md:mb-0">
              <p>&copy; 2025 Zapix. All rights reserved.</p>
              <p>
                Powered by{" "}
                <Link 
                  href="https://softsols.it.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
                >
                  SoftSols Pakistan
                </Link>
              </p>
            </div>

            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-all duration-200 hover:scale-105 cursor-pointer">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground transition-all duration-200 hover:scale-105 cursor-pointer">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}