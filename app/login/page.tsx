"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Zap, Eye, EyeOff, ArrowLeft, Mail, Lock, User, Stethoscope } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signIn("credentials", {
        email: loginData.email,
        password: loginData.password,
        type: "doctor",
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
      } else if (result?.ok) {
        router.push("/doctor");
      }
    } catch {
      setError("Login failed. Please try again.");
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto-login after successful signup
        const result = await signIn("credentials", {
          email: signupData.email,
          password: signupData.password,
          type: "doctor",
          redirect: false,
        });

        if (result?.ok) {
          router.push("/doctor");
        }
      } else {
        setError(data.error || "Signup failed");
      }
    } catch {
      setError("Signup failed. Please try again.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Login/Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Back to Home */}
          <Button variant="ghost" size="sm" asChild className="self-start">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>

          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="text-3xl font-bold text-foreground">Zapix</span>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full mb-4">
              <Stethoscope className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {mode === 'signup' ? 'Doctor Registration' : 'Healthcare Provider Portal'}
              </span>
            </div>
            
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'signup' 
                ? 'Join our platform to manage your medical practice efficiently'
                : 'Sign in to access your healthcare management dashboard'
              }
            </p>
          </div>

          {/* Main Form */}
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">
                {mode === 'signup' ? 'Create account' : 'Sign in'}
              </CardTitle>
              <CardDescription>
                {mode === 'signup' 
                  ? 'Enter your information to create your doctor account'
                  : 'Enter your credentials to access your dashboard'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {mode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="doctor@example.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        className="pl-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Signing in...
                      </>
                    ) : (
                      "Sign in to Dashboard"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Dr. John Smith"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="doctor@example.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a secure password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                        className="pl-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Creating account...
                      </>
                    ) : (
                      "Create doctor account"
                    )}
                  </Button>
                </form>
              )}

              {/* Toggle between login and signup */}
              <div className="mt-6">
                <Separator />
                <div className="text-center mt-4">
                  {mode === 'login' ? (
                    <p className="text-sm text-muted-foreground">
                      Don&apos;t have an account?{" "}
                      <button
                        onClick={() => {
                          setMode('signup');
                          setError("");
                        }}
                        className="text-primary hover:underline font-medium"
                      >
                        Create account
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <button
                        onClick={() => {
                          setMode('login');
                          setError("");
                        }}
                        className="text-primary hover:underline font-medium"
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help?{" "}
              <a 
                href="mailto:zapix2025@gmail.com" 
                className="text-primary hover:underline font-medium"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 bg-muted items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto">
            <Stethoscope className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Healthcare Management Platform</h2>
            <p className="text-muted-foreground">
              Streamline your medical practice with our comprehensive healthcare management solution. 
              Manage appointments, patient records, and communications all in one place.
            </p>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Patient appointment scheduling</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>WhatsApp integration for communication</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Comprehensive patient management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Secure and HIPAA-compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}