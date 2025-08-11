import { cn } from "@/lib/utils";
import { 
  Calendar, 
  MessageSquare, 
  CreditCard, 
  Clock, 
  Users, 
  Shield, 
  Zap, 
  CheckCircle 
} from "lucide-react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Instant Appointments",
      description:
        "Patients book instantly via WhatsApp. No phone calls, no scheduling conflicts.",
      icon: <Calendar className="h-6 w-6" />,
    },
    {
      title: "Smart WhatsApp Bot",
      description:
        "24/7 AI assistant handles booking, payments, and patient queries automatically.",
      icon: <MessageSquare className="h-6 w-6" />,
    },
    {
      title: "Integrated Payments",
      description:
        "JazzCash, EasyPaisa, and bank transfers. Payments verified before booking confirmation.",
      icon: <CreditCard className="h-6 w-6" />,
    },
    {
      title: "Reduce No-Shows",
      description: 
        "Automated reminders and payment requirements reduce no-shows by 80%.",
      icon: <Clock className="h-6 w-6" />,
    },
    {
      title: "Patient Management", 
      description: 
        "Complete EMR system with patient history, documents, and private notes.",
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "HIPAA Compliant",
      description:
        "Enterprise-grade security ensures patient data privacy and compliance.",
      icon: <Shield className="h-6 w-6" />,
    },
    {
      title: "5+ Hours Daily Saved",
      description:
        "Eliminate appointment scheduling overhead and focus purely on patient care.",
      icon: <Zap className="h-6 w-6" />,
    },
    {
      title: "99.9% Reliability",
      description: 
        "Built on enterprise infrastructure with 24/7 monitoring and support.",
      icon: <CheckCircle className="h-6 w-6" />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col py-10 relative group/feature",
        "lg:border-r border-muted-foreground/10",
        (index === 0 || index === 4) && "lg:border-l border-muted-foreground/10",
        index < 4 && "lg:border-b border-muted-foreground/10"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-primary/70">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-border group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
          {title}
        </span>
      </div>
      <p className="text-sm text-muted-foreground max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
