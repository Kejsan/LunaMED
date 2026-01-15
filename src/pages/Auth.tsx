import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Moon, Mail, Lock, User, ArrowRight, Sparkles, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { BackgroundEffects } from "@/components/layout/BackgroundEffects";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

// Rate limiting configuration
const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isPasswordReset = searchParams.get("reset") === "true";
  
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">(
    isPasswordReset ? "reset" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [healthConsent, setHealthConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  
  // Honeypot field for bot protection (should remain empty)
  const [honeypot, setHoneypot] = useState("");
  
  // Rate limiting state
  const [attempts, setAttempts] = useState<number[]>([]);
  const formStartTime = useRef(Date.now());
  
  const { signIn, signUp, user, resetPassword, updatePassword } = useAuth();
  const { isCelestial } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && mode !== "reset") {
      navigate("/dashboard");
    }
  }, [user, navigate, mode]);

  useEffect(() => {
    // Reset form start time when switching modes
    formStartTime.current = Date.now();
  }, [mode]);

  const isRateLimited = () => {
    const now = Date.now();
    const recentAttempts = attempts.filter(time => now - time < RATE_LIMIT_WINDOW_MS);
    return recentAttempts.length >= RATE_LIMIT_ATTEMPTS;
  };

  const recordAttempt = () => {
    const now = Date.now();
    setAttempts(prev => [...prev.filter(time => now - time < RATE_LIMIT_WINDOW_MS), now]);
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};
    
    if (mode !== "reset") {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        newErrors.email = emailResult.error.errors[0].message;
      }
    }
    
    if (mode !== "forgot") {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }

    if (mode === "reset" && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Bot detection: Check if honeypot is filled
    if (honeypot) {
      console.log("Bot detected");
      return;
    }

    // Bot detection: Check if form was submitted too quickly (< 2 seconds)
    const timeSpent = Date.now() - formStartTime.current;
    if (timeSpent < 2000) {
      toast({
        variant: "destructive",
        title: "Please slow down",
        description: "Please take a moment to fill out the form properly.",
      });
      return;
    }

    // Rate limiting check
    if (isRateLimited()) {
      toast({
        variant: "destructive",
        title: "Too many attempts",
        description: "Please wait 15 minutes before trying again.",
      });
      return;
    }

    if (!validateForm()) return;

    if (mode === "signup" && (!healthConsent || !termsConsent)) {
      toast({
        variant: "destructive",
        title: "Consent required",
        description: "Please accept both consent checkboxes to create an account.",
      });
      return;
    }
    
    setIsLoading(true);
    recordAttempt();

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: "destructive",
            title: "Sign in failed",
            description: error.message === "Invalid login credentials" 
              ? "Invalid email or password. Please try again."
              : error.message,
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
          navigate("/dashboard");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              variant: "destructive",
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Sign up failed",
              description: error.message,
            });
          }
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to LunaMed. Let's start tracking your cycle.",
          });
          navigate("/setup");
        }
      } else if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            variant: "destructive",
            title: "Reset failed",
            description: error.message,
          });
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a password reset link.",
          });
          setMode("login");
        }
      } else if (mode === "reset") {
        const { error } = await updatePassword(password);
        if (error) {
          toast({
            variant: "destructive",
            title: "Update failed",
            description: error.message,
          });
        } else {
          toast({
            title: "Password updated!",
            description: "You can now sign in with your new password.",
          });
          navigate("/dashboard");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "login": return "Welcome back";
      case "signup": return "Create your account";
      case "forgot": return "Reset your password";
      case "reset": return "Set new password";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "login": return "Sign in to continue tracking your rhythm";
      case "signup": return "Join thousands of women tracking their rhythm.";
      case "forgot": return "Enter your email to receive a reset link.";
      case "reset": return "Choose a strong password for your account.";
    }
  };

  return (
    <div className={`min-h-screen ${isCelestial ? "bg-background" : "bg-background"}`}>
      <BackgroundEffects />
      
      <div className="min-h-screen flex">
        {/* Left Panel - Moon Visual (Desktop) */}
        <div className={`hidden lg:flex lg:w-1/2 items-center justify-center p-12 ${
          isCelestial ? "bg-card/30" : "bg-muted/30"
        }`}>
          <div className="max-w-md text-center space-y-8">
            {/* Moon visualization */}
            <div className="relative mx-auto w-64 h-64">
              <div className={`absolute inset-0 rounded-full blur-3xl opacity-30 ${
                isCelestial ? "bg-gradient-to-br from-primary to-secondary" : "bg-primary/50"
              }`} />
              <div className={`relative w-full h-full rounded-full flex items-center justify-center ${
                isCelestial 
                  ? "bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/40" 
                  : "bg-primary/10 border border-primary/30"
              }`}>
                <Moon className="w-24 h-24 text-primary/60" />
              </div>
            </div>

            {isCelestial && (
              <>
                <h2 className="text-2xl font-light">Waxing Moon</h2>
                <p className="text-muted-foreground font-light">
                  A time of new beginnings. As the moon grows, channel your rising energy into setting intentions.
                </p>
              </>
            )}

            {!isCelestial && (
              <>
                <h2 className="text-2xl font-light">Evidence-Based Tracking</h2>
                <p className="text-muted-foreground font-light">
                  Join thousands of women using data-driven insights to understand their cycles better.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Logo />
              <ThemeToggle />
            </div>

            {/* Form Card */}
            <div className={`p-8 rounded-3xl border ${
              isCelestial 
                ? "bg-card/50 border-border/30 backdrop-blur-sm" 
                : "bg-card border-border"
            }`}>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-light mb-2">
                  {getTitle()}
                </h1>
                <p className="text-muted-foreground font-light text-sm">
                  {getSubtitle()}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot field - hidden from users, bots will fill it */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-light">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="Your name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10 bg-muted/20 border-border/50 rounded-xl h-12"
                      />
                    </div>
                  </div>
                )}

                {mode !== "reset" && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-light">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="luna@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        className={`pl-10 bg-muted/20 border-border/50 rounded-xl h-12 ${errors.email ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
                  </div>
                )}

                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-light">
                      {mode === "reset" ? "New Password" : "Password"}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors({ ...errors, password: undefined });
                        }}
                        className={`pl-10 bg-muted/20 border-border/50 rounded-xl h-12 ${errors.password ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
                  </div>
                )}

                {mode === "reset" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-light">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                        }}
                        className={`pl-10 bg-muted/20 border-border/50 rounded-xl h-12 ${errors.confirmPassword ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword}</p>}
                  </div>
                )}

                {/* Forgot Password Link */}
                {mode === "login" && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setErrors({});
                      }}
                      className="text-xs text-primary hover:underline font-light"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                {/* Consent Checkboxes */}
                {mode === "signup" && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="healthConsent"
                        checked={healthConsent}
                        onCheckedChange={(checked) => setHealthConsent(checked === true)}
                        className="mt-1"
                      />
                      <Label htmlFor="healthConsent" className="text-xs font-light text-muted-foreground leading-relaxed cursor-pointer">
                        I consent to the processing of sensitive health data regarding my menstruation cycle for the purpose of app functionality.{" "}
                        <a href="#" className="text-primary hover:underline">Learn more about our GDPR & HIPAA compliance.</a>
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="termsConsent"
                        checked={termsConsent}
                        onCheckedChange={(checked) => setTermsConsent(checked === true)}
                        className="mt-1"
                      />
                      <Label htmlFor="termsConsent" className="text-xs font-light text-muted-foreground leading-relaxed cursor-pointer">
                        I agree to the{" "}
                        <a href="#" className="text-primary hover:underline">Terms of Service</a>
                        {" "}and{" "}
                        <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                      </Label>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || isRateLimited()}
                  className={`w-full h-12 rounded-xl font-medium ${
                    isCelestial 
                      ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  {isLoading ? (
                    <Sparkles className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {mode === "login" && "Sign In"}
                      {mode === "signup" && "Create Account"}
                      {mode === "forgot" && "Send Reset Link"}
                      {mode === "reset" && "Update Password"}
                      {mode === "signup" && <Sparkles className="w-4 h-4 ml-2" />}
                      {(mode === "login" || mode === "forgot" || mode === "reset") && <ArrowRight className="w-4 h-4 ml-2" />}
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                {mode === "forgot" && (
                  <button
                    onClick={() => {
                      setMode("login");
                      setErrors({});
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light flex items-center justify-center gap-2 mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to sign in
                  </button>
                )}
                
                {(mode === "login" || mode === "signup") && (
                  <button
                    onClick={() => {
                      setMode(mode === "login" ? "signup" : "login");
                      setErrors({});
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
                  >
                    {mode === "login" ? "Don't have an account? " : "Already tracking with us? "}
                    <span className="text-primary font-medium">{mode === "login" ? "Sign Up" : "Sign In"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Encrypted Vault • HIPAA • GDPR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;