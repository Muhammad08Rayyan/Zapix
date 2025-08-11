"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface PricingPlan {
  name: string;
  title: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline";
  popular?: boolean;
}

interface PricingSectionProps {
  onButtonClick: () => void;
}

export function PricingSection({ onButtonClick }: PricingSectionProps) {
  const plans: PricingPlan[] = [
    {
      name: "essential",
      title: "Essential",
      description: "Perfect for small practices that want simplicity",
      price: "₨10,000",
      period: "/month",
      features: [
        "1,000 WhatsApp messages included",
        "Unlimited appointments & patients", 
        "Complete EMR system",
        "24/7 WhatsApp patient assistant",
        "Payment receipt verification"
      ],
      buttonText: "Get Started",
      buttonVariant: "outline"
    },
    {
      name: "pro", 
      title: "Pro",
      description: "For growing practices that need flexibility",
      price: "₨15,000",
      period: "/month",
      features: [
        "2,500 WhatsApp messages included",
        "Everything in Essential plan",
        "Customizable appointment limits", 
        "Advanced appointment analytics",
        "Priority support (24/7 chat)"
      ],
      buttonText: "Get Started",
      popular: true
    },
    {
      name: "custom",
      title: "Custom", 
      description: "For high-volume practices with unique needs",
      price: "Custom",
      period: " pricing",
      features: [
        "Unlimited message allowances",
        "Multiple doctor accounts",
        "Enterprise workflow automation",
        "Dedicated account manager",
        "24/7 phone & WhatsApp support"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline"
    }
  ];

  const getCardClassName = (plan: PricingPlan) => {
    if (plan.popular) {
      return "border-2 border-primary relative overflow-hidden flex flex-col shadow-lg scale-105";
    }
    return "flex flex-col relative border border-border/20 hover:border-primary/30 transition-all duration-300";
  };

  return (
    <section id="pricing" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Plans That Work For Every Practice</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose your plan, admin assigns it, you inherit perfect settings instantly. Focus on patients, not configuration.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={getCardClassName(plan)}>
              {plan.popular && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <Badge className="animate-pulse shadow-lg">Most Popular</Badge>
                  </div>
                </>
              )}
              
              <CardHeader className="relative">
                <CardTitle className="text-xl">{plan.title}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="relative flex-grow flex flex-col justify-between">
                
                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={onButtonClick}
                  className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  variant={plan.buttonVariant}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}