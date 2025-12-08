import { Moon, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
              <Moon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-light tracking-wide">
              Luna<span className="font-semibold">Med</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#science" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">
              Science
            </a>
            <a href="#insights" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">
              Insights
            </a>
            <Button variant="ghost" size="sm" className="text-sm font-light">
              Sign In
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted/20 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/20 pt-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#science" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">
                Science
              </a>
              <a href="#insights" className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors">
                Insights
              </a>
              <div className="flex gap-3 mt-2">
                <Button variant="ghost" size="sm" className="flex-1 text-sm font-light">
                  Sign In
                </Button>
                <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
