import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Share2, Clock, BookOpen } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { BackgroundEffects } from "@/components/layout/BackgroundEffects";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";

const Article = () => {
  const navigate = useNavigate();
  const { isCelestial } = useTheme();
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const [readProgress, setReadProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setReadProgress((winScroll / height) * 100);
      setScrolled(winScroll > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-700 ${isCelestial ? "bg-background text-foreground" : "bg-background text-foreground"}`}>
      <BackgroundEffects />

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 border-b ${scrolled ? "py-3 backdrop-blur-md shadow-lg" : "py-5 bg-transparent"} ${isCelestial ? "border-white/10 bg-background/80" : "border-border bg-background/80"}`}>
        {/* Reading Progress Bar */}
        <div
          className={`absolute bottom-0 left-0 h-[2px] transition-all duration-200 ${isCelestial ? "bg-gradient-to-r from-primary to-purple-500" : "bg-primary"}`}
          style={{ width: `${readProgress}%` }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/encyclopedia")}
              className={`p-1.5 rounded-full border transition-colors ${isCelestial ? "border-white/20 hover:bg-white/10" : "border-border hover:bg-muted"}`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <Logo />
            <div className={`hidden md:flex items-center gap-2 text-sm opacity-60 border-l pl-6 ${isCelestial ? "border-white/10" : "border-border"}`}>
              <span>{t("encyclopedia")}</span>
              <span>›</span>
              <span className={`font-medium ${isCelestial ? "text-purple-300" : "text-primary"}`}>{t("articleCyclePhases")}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className={`p-2 rounded-full transition-colors ${isCelestial ? "hover:bg-white/10" : "hover:bg-muted"}`}>
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col relative z-10 pt-28 pb-20">
        {/* Article Header */}
        <header className="max-w-4xl mx-auto px-6 w-full text-center mb-16 relative">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 backdrop-blur-sm ${isCelestial ? "border-purple-500/30 text-purple-200 bg-purple-900/10" : "border-primary/30 text-primary bg-primary/10"}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isCelestial ? "bg-purple-400" : "bg-primary"}`} />
            <span className="text-xs font-bold uppercase tracking-widest">{t("articleCycleDays")}</span>
          </div>

          <h1 className={`text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight transition-colors duration-500 ${isCelestial ? "text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200" : "text-foreground"}`}>
            {t("articleUnderstanding")} <br />
            <span className={`italic font-light ${isCelestial ? "text-purple-300" : "text-primary"}`}>{t("articleFollicularPhase")}</span>
          </h1>

          <div className={`flex items-center justify-center gap-8 text-sm font-medium ${isCelestial ? "text-muted-foreground" : "text-muted-foreground"}`}>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              5 {t("minRead")}
            </div>
            <div className="w-1 h-1 rounded-full bg-current opacity-50" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-muted overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100"
                  className="w-full h-full object-cover"
                  alt="Reviewer"
                />
              </div>
              <span>{t("reviewedBy")} Dr. S. Chen</span>
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Article Content */}
          <div className="lg:col-span-8 article-content">
            <p className={`text-xl md:text-2xl font-light mb-10 ${isCelestial ? "text-indigo-100" : "text-muted-foreground"}`}>
              {t("articleIntro")}
            </p>

            {/* Hormone Chart */}
            <div className={`my-12 p-1 rounded-3xl border transition-all duration-500 ${isCelestial ? "bg-gradient-to-br from-white/10 to-transparent border-white/10" : "bg-card border-border shadow-xl"}`}>
              <div className={`relative w-full aspect-[16/9] rounded-[22px] overflow-hidden p-6 ${isCelestial ? "bg-[#0B0F19]" : "bg-muted"}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{t("hormonalLandscape")}</h3>
                    <p className="text-xs opacity-60">{t("articleCycleDays")}</p>
                  </div>
                  <div className="flex gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-pink-500" /> {t("estrogen")}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" /> FSH
                    </div>
                  </div>
                </div>

                <div className="relative h-48 w-full mt-8">
                  <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
                    <div className="w-full h-px bg-current" />
                    <div className="w-full h-px bg-current" />
                    <div className="w-full h-px bg-current" />
                    <div className="w-full h-px bg-current" />
                  </div>

                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,70 Q20,60 40,80 T100,60" fill="none" stroke="#3b82f6" strokeWidth="2" className="opacity-60" />
                    <path d="M0,80 Q30,80 60,60 T100,20" fill="none" stroke="#ec4899" strokeWidth="2" className="opacity-80" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Article Text */}
            <div className={`prose prose-lg max-w-none ${isCelestial ? "prose-invert text-slate-300" : "text-foreground"}`}>
              <h3>{t("biologicalPerspective")}</h3>
              <p>{t("biologicalContent")}</p>

              <blockquote className={`not-italic pl-6 border-l-4 my-8 py-2 rounded-r-lg ${isCelestial ? "border-purple-500 bg-purple-900/10 text-purple-100" : "border-primary bg-primary/10 text-foreground"}`}>
                <div className="relative z-10">{t("estrogenQuote")}</div>
              </blockquote>

              <h3>{t("astrologicalConnection")}</h3>
              <p>{t("astrologicalContent")}</p>
            </div>

            {/* Personal Insight Card */}
            <div className={`mt-12 p-6 rounded-2xl border flex flex-col sm:flex-row gap-6 items-center ${isCelestial ? "bg-[#0B0F19] border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]" : "bg-gradient-to-r from-primary/10 to-background border-border shadow-md"}`}>
              <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl ${isCelestial ? "bg-indigo-900/50 text-indigo-300" : "bg-primary/20 text-primary"}`}>
                ✨
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h4 className="font-bold text-lg mb-1">{t("personalPattern")}</h4>
                <p className="text-sm opacity-80 mb-3">{t("personalPatternDesc")}</p>
                <button
                  onClick={() => navigate("/logger")}
                  className={`text-sm font-bold underline decoration-2 underline-offset-4 hover:opacity-70 transition-opacity ${isCelestial ? "text-indigo-400 decoration-indigo-500/50" : "text-primary decoration-primary/50"}`}
                >
                  {t("viewSymptomLogs")} →
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-32 space-y-6">
              {/* Table of Contents */}
              <div className={`p-6 rounded-2xl border backdrop-blur-md ${isCelestial ? "bg-white/5 border-white/10" : "bg-card border-border shadow-lg"}`}>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">{t("onThisPage")}</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3 group cursor-pointer">
                    <div className={`w-1.5 h-1.5 rounded-full ${isCelestial ? "bg-purple-400" : "bg-primary"}`} />
                    <span className="opacity-70 group-hover:opacity-100 transition-opacity">{t("biologicalPerspective")}</span>
                  </li>
                  <li className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20 group-hover:bg-primary transition-colors" />
                    <span className="opacity-70 group-hover:opacity-100 transition-opacity">{t("hormoneGraph")}</span>
                  </li>
                  <li className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20 group-hover:bg-primary transition-colors" />
                    <span className="opacity-70 group-hover:opacity-100 transition-opacity">{t("astrologicalConnection")}</span>
                  </li>
                </ul>
              </div>

              {/* Related Symptoms */}
              <div className={`p-6 rounded-2xl border backdrop-blur-md ${isCelestial ? "bg-white/5 border-white/10" : "bg-card border-border shadow-lg"}`}>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">{t("relatedSymptoms")}</h4>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${isCelestial ? "bg-purple-500/20 border-purple-500/30 text-purple-200" : "bg-primary/10 border-primary/20 text-primary"}`}>
                    {t("energetic")}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${isCelestial ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-200" : "bg-primary/10 border-primary/20 text-primary"}`}>
                    {t("clearSkin")}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${isCelestial ? "bg-pink-500/20 border-pink-500/30 text-pink-200" : "bg-pink-100 border-pink-200 text-pink-700"}`}>
                    {t("highLibido")}
                  </span>
                </div>
              </div>

              {/* Quick Fact */}
              <div className={`relative overflow-hidden p-6 rounded-2xl border ${isCelestial ? "bg-gradient-to-br from-indigo-900/40 to-black border-indigo-500/30" : "bg-slate-900 text-white border-slate-800"}`}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <BookOpen className="w-20 h-20" />
                </div>
                <h4 className="relative z-10 text-xs font-bold uppercase tracking-widest mb-2 text-yellow-400">{t("didYouKnow")}</h4>
                <p className="relative z-10 text-sm font-light leading-relaxed text-white">
                  {t("didYouKnowContent")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Article;
