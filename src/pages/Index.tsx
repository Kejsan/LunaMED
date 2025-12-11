import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Shield, Lock, Sparkles, FileText, Brain, Star, ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { BackgroundEffects } from "@/components/layout/BackgroundEffects";
import { LanguageSelector } from "@/components/LanguageSelector";

const Index = () => {
  const { isCelestial } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cycleDay] = useState(14);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Science", href: "#science" },
    { label: "Privacy", href: "#privacy" },
  ];

  return (
    <div className={`min-h-screen ${isCelestial ? "bg-background" : "bg-background"}`}>
      <BackgroundEffects />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Logo />
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <LanguageSelector variant="compact" />
              <ThemeToggle />
              <Button
                onClick={() => navigate("/auth")}
                className={`hidden md:flex h-10 px-6 rounded-full font-medium ${
                  isCelestial 
                    ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {t("getStarted")}
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/20 bg-background/95 backdrop-blur-xl">
            <div className="container mx-auto px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Button
                onClick={() => navigate("/auth")}
                className="w-full rounded-full"
              >
                Start Tracking
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-light text-muted-foreground">
                  {isCelestial ? "Celestial precision" : "Medical precision"}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight leading-tight">
                {isCelestial ? (
                  <>
                    Wisdom of the{" "}
                    <span className="font-normal bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Stars.
                    </span>
                  </>
                ) : (
                  <>
                    Track with{" "}
                    <span className="font-normal text-primary">
                      Clinical Precision.
                    </span>
                  </>
                )}
              </h1>

              <p className="text-lg text-muted-foreground font-light max-w-xl mx-auto lg:mx-0">
                The first period tracker that seamlessly blends clinical accuracy with 
                {isCelestial ? " astrological insights" : " data-driven predictions"}. 
                Get medical reports for your doctor{isCelestial && ", and lunar phases for your soul"}.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  className={`h-14 px-8 rounded-full text-base font-medium ${
                    isCelestial 
                      ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  Start Tracking Free
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 rounded-full text-base font-light border-border/50"
                  onClick={() => document.getElementById("science")?.scrollIntoView({ behavior: "smooth" })}
                >
                  View Science
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-4 h-4 text-primary" />
                  <span>End-to-End Encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>GDPR Ready</span>
                </div>
              </div>
            </div>

            {/* Right - Cycle Visualization */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Outer glow */}
                <div className={`absolute inset-0 rounded-full blur-3xl opacity-30 ${
                  isCelestial ? "bg-gradient-to-br from-primary to-secondary" : "bg-primary/50"
                }`} />
                
                {/* Main orb */}
                <div className={`relative w-72 h-72 md:w-96 md:h-96 rounded-full flex items-center justify-center ${
                  isCelestial 
                    ? "bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30" 
                    : "bg-primary/10 border border-primary/20"
                }`}>
                  {/* Inner content */}
                  <div className="text-center space-y-2">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Cycle Day</p>
                    <p className="text-6xl md:text-7xl font-extralight">{cycleDay}</p>
                    {isCelestial && (
                      <p className="text-xs uppercase tracking-widest text-primary">
                        ☽ Waxing Gibbous
                      </p>
                    )}
                  </div>

                  {/* Floating indicators */}
                  <div className="absolute -top-4 -right-4 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-xs">
                    Fertile Window
                  </div>
                  <div className="absolute -bottom-4 -left-4 px-3 py-1.5 rounded-full bg-muted border border-border/30 text-xs">
                    Light Cramping
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extralight mb-4">
              Complete Cycle{" "}
              <span className={isCelestial ? "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" : "text-primary"}>
                Intelligence
              </span>
            </h2>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto">
              Whether you need data for your gynecologist or alignment for your rituals, LunaMed adapts to you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Medical Reports */}
            <div className={`p-8 rounded-3xl border transition-all hover:scale-[1.02] ${
              isCelestial 
                ? "bg-card/50 border-border/30 backdrop-blur-sm" 
                : "bg-card border-border"
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
                isCelestial ? "bg-primary/20" : "bg-primary/10"
              }`}>
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-light mb-3">Medical Reports</h3>
              <p className="text-muted-foreground font-light text-sm leading-relaxed">
                Generate PDF reports detailing cycle regularity, symptom intensity, and spotting patterns. Perfect for your next check-up.
              </p>
            </div>

            {/* AI Predictions */}
            <div className={`p-8 rounded-3xl border transition-all hover:scale-[1.02] ${
              isCelestial 
                ? "bg-card/50 border-border/30 backdrop-blur-sm" 
                : "bg-card border-border"
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
                isCelestial ? "bg-secondary/20" : "bg-primary/10"
              }`}>
                <Brain className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-light mb-3">AI Predictions</h3>
              <p className="text-muted-foreground font-light text-sm leading-relaxed">
                Our algorithm learns your unique rhythm. It adapts to irregularities and predicts your next phase with high precision.
              </p>
            </div>

            {/* Lunar Alignment */}
            {isCelestial && (
              <div className="p-8 rounded-3xl border bg-card/50 border-border/30 backdrop-blur-sm transition-all hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-accent/20">
                  <Moon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-light mb-3">Lunar Alignment</h3>
                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  Track how your cycle syncs with the moon phases. Understand your energy levels through an astrological lens.
                </p>
              </div>
            )}

            {/* Data Analytics (Science mode) */}
            {!isCelestial && (
              <div className="p-8 rounded-3xl border bg-card border-border transition-all hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-primary/10">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-light mb-3">Data Analytics</h3>
                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  Visualize trends, correlations, and patterns in your cycle data with advanced analytics and charts.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section id="privacy" className="py-24">
        <div className="container mx-auto px-6">
          <div className={`max-w-4xl mx-auto p-12 rounded-3xl border ${
            isCelestial 
              ? "bg-card/50 border-border/30 backdrop-blur-sm" 
              : "bg-card border-border"
          }`}>
            <div className="text-center">
              <Lock className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-extralight mb-4">
                Your Data is Yours.{" "}
                <span className={isCelestial ? "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" : "text-primary"}>
                  Period.
                </span>
              </h2>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <span className="px-4 py-2 rounded-full bg-primary/10 text-sm">GDPR Ready</span>
                <span className="px-4 py-2 rounded-full bg-primary/10 text-sm">HIPAA Standard</span>
                <span className="px-4 py-2 rounded-full bg-primary/10 text-sm">AES-256</span>
              </div>
              <p className="text-muted-foreground font-light max-w-xl mx-auto">
                We store data locally on your device by default. Your health information is encrypted end-to-end and never shared without your explicit consent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Science Section */}
      <section id="science" className="py-24">
        <div className="container mx-auto px-6">
          <div className={`max-w-4xl mx-auto p-12 rounded-3xl border ${
            isCelestial 
              ? "bg-card/50 border-border/30 backdrop-blur-sm" 
              : "bg-card border-border"
          }`}>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 ${
                isCelestial ? "bg-primary/20" : "bg-primary/10"
              }`}>
                <span className="text-3xl">🩺</span>
              </div>
              <div>
                <p className="text-lg font-light italic mb-4 text-foreground/90">
                  "LunaMed bridges the gap between patient self-awareness and clinical data. It empowers women to understand their biology while respecting their holistic experience."
                </p>
                <p className="text-sm text-muted-foreground">
                  — Dr. Sarah Chen, MD, OB/GYN Specialist
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extralight mb-6">
            Ready to Begin Your{" "}
            <span className={isCelestial ? "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" : "text-primary"}>
              Journey?
            </span>
          </h2>
          <p className="text-muted-foreground font-light text-lg mb-8 max-w-xl mx-auto">
            Join thousands of women who track their cycles with LunaMed.
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className={`h-14 px-12 rounded-full text-lg font-medium ${
              isCelestial 
                ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo />
            <div className="flex gap-8 text-sm text-muted-foreground font-light">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookie Settings</a>
            </div>
            <p className="text-sm text-muted-foreground font-light">
              © 2024 LunaMed Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;