import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Mail, Lock, User, ArrowRight, Sparkles, Shield } from "lucide-react";
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

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [healthConsent, setHealthConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, user } = useAuth();
  const { isCelestial } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!isLogin && (!healthConsent || !termsConsent)) {
      toast({
        variant: "destructive",
        title: "Consent required",
        description: "Please accept both consent checkboxes to create an account.",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      if (isLogin) {
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
      } else {
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
      }
    } finally {
      setIsLoading(false);
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
                  {isLogin ? "Welcome back" : "Create your account"}
                </h1>
                <p className="text-muted-foreground font-light text-sm">
                  {isLogin 
                    ? "Sign in to continue tracking your rhythm" 
                    : "Join thousands of women tracking their rhythm."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
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

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-light">Password</Label>
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

                {/* Consent Checkboxes */}
                {!isLogin && (
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
                  disabled={isLoading}
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
                      {isLogin ? "Sign In" : "Create Account"}
                      {!isLogin && <Sparkles className="w-4 h-4 ml-2" />}
                      {isLogin && <ArrowRight className="w-4 h-4 ml-2" />}
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
                >
                  {isLogin ? "Don't have an account? " : "Already tracking with us? "}
                  <span className="text-primary font-medium">{isLogin ? "Sign Up" : "Sign In"}</span>
                </button>
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