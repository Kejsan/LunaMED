import { Droplet, Heart, Moon, Sparkles, TrendingUp, Calendar, Brain, Activity } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { CycleOrb } from "@/components/CycleOrb";
import { PhaseCard } from "@/components/PhaseCard";
import { InsightCard } from "@/components/InsightCard";
import { CalendarPreview } from "@/components/CalendarPreview";
import { Button } from "@/components/ui/button";

const phases = [
  {
    title: "Menstrual Phase",
    description: "Your body is shedding its uterine lining. Rest and self-care are key.",
    icon: Droplet,
    daysRange: "Days 1-5",
    id: "menstrual",
  },
  {
    title: "Follicular Phase",
    description: "Rising estrogen boosts energy and mood. Great time for new projects.",
    icon: Sparkles,
    daysRange: "Days 6-13",
    id: "follicular",
  },
  {
    title: "Ovulation",
    description: "Peak fertility window. Energy and confidence are at their highest.",
    icon: Heart,
    daysRange: "Days 14-16",
    id: "ovulation",
  },
  {
    title: "Luteal Phase",
    description: "Progesterone rises. Focus on calming activities and nutrition.",
    icon: Moon,
    daysRange: "Days 17-28",
    id: "luteal",
  },
];

const Index = () => {
  const currentDay = 12;
  const cycleLength = 28;
  const currentPhase = "follicular" as const;

  return (
    <div className="min-h-screen bg-cosmos">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background stars effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-foreground/20 rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-foreground/30 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-foreground/20 rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-foreground/40 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-1/3 right-1/2 w-1 h-1 bg-foreground/20 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-sm">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="font-light text-muted-foreground">Science meets celestial wisdom</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight leading-tight">
                Track Your Cycle with{" "}
                <span className="text-gradient-celestial font-normal">Celestial Precision</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground font-light max-w-xl mx-auto lg:mx-0">
                LunaMed combines beautiful design with science-backed insights for comprehensive period and fertility tracking.
              </p>
              
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="/auth">
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-medium px-8 h-12 rounded-xl">
                  Start Tracking
                </Button>
              </a>
              <a href="#features">
                <Button size="lg" variant="outline" className="font-light h-12 rounded-xl border-border/50 hover:bg-muted/20">
                  Learn More
                </Button>
              </a>
            </div>
            </div>

            {/* Right: Cycle Orb */}
            <div className="flex justify-center animate-fade-in animation-delay-200">
              <CycleOrb currentDay={currentDay} cycleLength={cycleLength} phase={currentPhase} />
            </div>
          </div>
        </div>
      </section>

      {/* Phases Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-extralight mb-4">
              Understand Your <span className="text-gradient-celestial font-normal">Phases</span>
            </h2>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto">
              Each phase of your cycle brings unique changes. Learn to work with your body's natural rhythm.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {phases.map((phase, i) => (
              <div key={phase.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <PhaseCard
                  title={phase.title}
                  description={phase.description}
                  icon={phase.icon}
                  daysRange={phase.daysRange}
                  isActive={phase.id === currentPhase}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section id="insights" className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Calendar */}
            <div className="flex justify-center animate-fade-in">
              <CalendarPreview />
            </div>

            {/* Insights Cards */}
            <div className="space-y-6 animate-fade-in animation-delay-200">
              <h2 className="text-3xl md:text-4xl font-extralight mb-8">
                Personalized <span className="text-gradient-celestial font-normal">Insights</span>
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <InsightCard
                  title="Cycle Length"
                  value="28 days"
                  subtitle="Consistent pattern"
                  icon={Calendar}
                  trend="stable"
                />
                <InsightCard
                  title="Next Period"
                  value="16 days"
                  subtitle="December 24"
                  icon={TrendingUp}
                />
                <InsightCard
                  title="Mood Pattern"
                  value="Positive"
                  subtitle="Higher energy phase"
                  icon={Brain}
                  trend="up"
                />
                <InsightCard
                  title="Activity Level"
                  value="Moderate"
                  subtitle="Great for workouts"
                  icon={Activity}
                  trend="up"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Science Section */}
      <section id="science" className="py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto glass-dark rounded-3xl p-12 animate-fade-in">
            <Moon className="w-12 h-12 text-secondary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-extralight mb-6">
              Backed by <span className="text-gradient-celestial font-normal">Science</span>
            </h2>
            <p className="text-muted-foreground font-light text-lg leading-relaxed mb-8">
              LunaMed uses evidence-based algorithms to predict your cycle with precision. 
              Our tracking methods are developed in collaboration with OB-GYNs and 
              fertility specialists to provide you with accurate, reliable insights.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-light text-gradient-celestial">98%</div>
                <div className="text-sm text-muted-foreground font-light">Prediction Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-gradient-celestial">2M+</div>
                <div className="text-sm text-muted-foreground font-light">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-gradient-celestial">50+</div>
                <div className="text-sm text-muted-foreground font-light">Health Metrics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extralight mb-6">
              Ready to Begin Your <span className="text-gradient-celestial font-normal">Journey?</span>
            </h2>
            <p className="text-muted-foreground font-light text-lg mb-8">
              Join millions of women who track their cycles with LunaMed.
            </p>
            <a href="/auth">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-medium px-12 h-14 rounded-xl text-lg">
                Get Started Free
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
                <Moon className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-light">
                Luna<span className="font-semibold">Med</span>
              </span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground font-light">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
            <p className="text-sm text-muted-foreground font-light">
              © 2024 LunaMed. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
