"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Calendar, Users, MessageSquare, FileText, Shield, Zap, Mail, Send, Sun, Moon, Info } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export default function HomePage() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  const conversationTooltipText =
    "A 'conversation' follows WhatsApp Business's 24-hour session window: once a patient or your bot sends the first message, a 24-hour window opens and all messages in that window count as a single conversation. When the window expires and messaging resumes, it counts as a new conversation.";

  function ConversationFeature({ featureText }: { featureText: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
      const handlePointerDown = (e: MouseEvent | TouchEvent | PointerEvent) => {
        const target = e.target as Node;
        if (containerRef.current && !containerRef.current.contains(target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("pointerdown", handlePointerDown);
      return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, []);

    const toggleOpen = () => setIsOpen((prev) => !prev);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleOpen();
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    return (
      <span
        ref={containerRef}
        className="relative group inline-flex items-center"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
      >
        <span className="underline decoration-dotted underline-offset-2 cursor-pointer">{featureText}</span>
        <Info className={`ml-1 h-3.5 w-3.5 transition-colors ${isOpen ? "text-primary" : "text-muted-foreground/80"} group-hover:text-primary`} />
        <span className={`pointer-events-none absolute left-0 top-full mt-2 max-w-xs rounded-md border bg-background p-3 text-xs shadow-lg transition-all duration-200 z-20 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 ${isOpen ? "opacity-100 translate-y-0" : ""}`}>
          {conversationTooltipText}
        </span>
      </span>
    );
  }

  const renderFeatureItem = (feature: string, index: number) => {
    const isConversationItem = /conversation/i.test(feature);
    if (!isConversationItem) {
      return (
        <li key={index} className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-primary" />
          <span>{feature}</span>
        </li>
      );
    }

    return (
      <li key={index} className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-primary" />
        <ConversationFeature featureText={feature} />
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
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
              className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 relative group"
            >
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </button>
            <button 
              onClick={() => scrollToSection('pricing')} 
              className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 relative group"
            >
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 relative group"
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
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4 opacity-0 animate-[fadeIn_0.6s_ease-out_0.1s_forwards]">
            Revolutionizing Healthcare Communication
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 opacity-0 animate-[fadeIn_0.6s_ease-out_0.2s_forwards]">
            Smart WhatsApp-Based
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Doctor Appointment System</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto opacity-0 animate-[fadeIn_0.6s_ease-out_0.3s_forwards]">
            Streamline your medical practice with our intelligent WhatsApp bot that handles patient bookings, 
            payments, and communication automatically. Built for modern healthcare providers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-[fadeIn_0.6s_ease-out_0.4s_forwards]">
            <Button size="lg" asChild className="transition-all duration-300 hover:scale-105 hover:shadow-xl group">
              <button onClick={() => scrollToSection('features')}>
                Explore Features
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </button>
            </Button>
            <Button size="lg" variant="outline" asChild className="transition-all duration-300 hover:scale-105 hover:shadow-xl group">
              <Link href="/login">
                Get Started
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage appointments and patient communication through WhatsApp
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: MessageSquare, title: "WhatsApp Integration", description: "Native WhatsApp Business API integration for seamless patient communication" },
              { icon: Calendar, title: "Smart Booking System", description: "Automated appointment scheduling with real-time availability and conflict prevention" },
              { icon: Users, title: "Patient Management", description: "Complete EMR system with patient history, documents, and medical records" },
              { icon: MessageSquare, title: "Payment Processing", description: "Accept payments via JazzCash, EasyPaisa, and bank transfers with receipt verification" },
              { icon: FileText, title: "Document Handling", description: "Secure document upload, storage, and sharing through WhatsApp" },
              { icon: Shield, title: "Admin Dashboard", description: "Comprehensive admin panel for managing doctors, patients, and system settings" }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer">
                  <CardHeader>
                    <IconComponent className="w-8 h-8 text-primary mb-2 transition-transform group-hover:scale-110 duration-200" />
                    <CardTitle className="group-hover:text-primary transition-colors duration-200">{feature.title}</CardTitle>
                    <CardDescription>
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple steps to revolutionize your practice</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Patient Contacts", description: "Patient sends message to your WhatsApp Business number" },
              { step: "2", title: "AI Handles Booking", description: "Bot guides patient through registration, slot selection, and payment" },
              { step: "3", title: "Doctor Manages", description: "Doctor reviews, confirms, and manages appointments through dashboard" }
            ].map((item, index) => (
              <div key={index} className="text-center group">
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the plan that fits your practice</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <CardDescription>Perfect for solo practitioners</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">₨10,000</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <ul className="space-y-2 mb-6">
                  {[
                    "1,000 WhatsApp conversations/month",
                    "Unlimited appointments",
                    "Basic patient management",
                    "Payment processing",
                    "Email support"
                  ].map((feature, index) => renderFeatureItem(feature, index))}
                </ul>
                <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary relative overflow-hidden flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
              <CardHeader className="relative">
                <Badge className="w-fit mb-2 animate-pulse">Most Popular</Badge>
                <CardTitle>Premium</CardTitle>
                <CardDescription>For growing practices</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">₨15,000</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="relative flex-grow flex flex-col justify-between">
                <ul className="space-y-2 mb-6">
                  {[
                    "2,500 WhatsApp conversations/month",
                    "Unlimited appointments",
                    "Advanced EMR features",
                    "Document management",
                    "Analytics & reporting",
                    "Priority support"
                  ].map((feature, index) => renderFeatureItem(feature, index))}
                </ul>
                <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For clinics and hospitals</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">Custom</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <ul className="space-y-2 mb-6">
                  {[
                    "Custom conversation limits",
                    "Unlimited appointments",
                    "Multiple doctors support",
                    "Custom integrations",
                    "Dedicated account manager",
                    "24/7 phone support"
                  ].map((feature, index) => renderFeatureItem(feature, index))}
                </ul>
                <Button className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform your medical practice today. Contact us for a personalized demo and setup assistance.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="transition-all duration-300 hover:shadow-lg group">
                <CardContent className="pt-6 text-center">
                  <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2 transition-transform group-hover:scale-110 duration-200" />
                  <h3 className="font-semibold mb-1">WhatsApp</h3>
                  <p className="text-muted-foreground">+92 301 2712507</p>
                </CardContent>
              </Card>
              
              <Card className="transition-all duration-300 hover:shadow-lg group">
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
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>We&apos;ll get back to you within 24 hours</CardDescription>
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
                        placeholder="Tell us about your practice and how we can help..."
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
              <Link href="/privacy" className="hover:text-foreground transition-all duration-200 hover:scale-105">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground transition-all duration-200 hover:scale-105">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}