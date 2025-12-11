import { useState } from "react";
import { Search, BookOpen, Heart, Shield, UtensilsCrossed, ChevronRight, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { AppLayout } from "@/components/layout/AppLayout";

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  reviewed: boolean;
}

const articles: Article[] = [
  {
    id: "1",
    title: "The Four Seasons of Your Cycle",
    description: "Understanding the distinct phases: Menstrual, Follicular, Ovulatory, and Luteal, and how to harness their energy.",
    category: "biology",
    readTime: "6 min",
    reviewed: true,
  },
  {
    id: "2",
    title: "Polycystic Ovary Syndrome (PCOS)",
    description: "A comprehensive guide to symptoms, diagnosis criteria, and the latest management strategies.",
    category: "disorders",
    readTime: "12 min",
    reviewed: true,
  },
  {
    id: "3",
    title: "Seed Cycling: Myth or Magic?",
    description: "Investigating the science behind rotating flax, pumpkin, sesame, and sunflower seeds to balance hormones.",
    category: "nutrition",
    readTime: "5 min",
    reviewed: false,
  },
  {
    id: "4",
    title: "Endometriosis Pain Management",
    description: "Clinical approaches and holistic therapies for managing flare-ups and chronic pelvic pain.",
    category: "disorders",
    readTime: "8 min",
    reviewed: true,
  },
  {
    id: "5",
    title: "Choosing the Right Contraceptive",
    description: "Comparing hormonal IUDs, copper IUDs, pills, and patches based on lifestyle and biology.",
    category: "birth-control",
    readTime: "10 min",
    reviewed: true,
  },
  {
    id: "6",
    title: "Iron-Rich Foods for Menstruation",
    description: "Combat fatigue during your period with this curated list of heme and non-heme iron sources.",
    category: "nutrition",
    readTime: "4 min",
    reviewed: true,
  },
  {
    id: "7",
    title: "The Gut-Hormone Connection",
    description: "New research suggests that your microbiome plays a bigger role in PMS symptoms than previously thought.",
    category: "biology",
    readTime: "8 min",
    reviewed: true,
  },
  {
    id: "8",
    title: "Understanding Amenorrhea",
    description: "When periods stop: causes, implications, and when to seek medical attention.",
    category: "disorders",
    readTime: "7 min",
    reviewed: true,
  },
];

const categories = [
  { id: "all", label: "All", icon: BookOpen },
  { id: "biology", label: "Biology 101", icon: Heart },
  { id: "disorders", label: "Disorders", icon: Shield },
  { id: "birth-control", label: "Birth Control", icon: Shield },
  { id: "nutrition", label: "Nutrition", icon: UtensilsCrossed },
];

const popularTags = ["PCOS", "Endometriosis", "Ovulation", "Sleep"];

const glossaryTerms = [
  { term: "Luteal Phase", definition: "The second half of the menstrual cycle, after ovulation." },
  { term: "Progesterone", definition: "Hormone released by the corpus luteum preparing body for pregnancy." },
  { term: "Amenorrhea", definition: "The absence of menstruation, often defined as missing one or more periods." },
];

const Encyclopedia = () => {
  const { isCelestial } = useTheme();
  const isDark = isCelestial;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticle = articles.find(a => a.id === "7");

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-gradient-celestial' : 'text-gradient-science'}`}>
            {isDark ? "Cosmic Knowledge Base" : "Health Encyclopedia"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isDark ? "Wisdom for your cycle, body, and soul" : "Evidence-based information for your health journey"}
          </p>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for symptoms, biology, or nutrition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
          </div>
          
          {/* Popular Tags */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-3 py-1 rounded-full text-sm bg-muted/50 hover:bg-muted transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : isDark ? 'glass-dark' : 'glass-light'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {featuredArticle && activeCategory === "all" && !searchQuery && (
          <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'} relative overflow-hidden`}>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
              Editor's Pick
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Medically Reviewed</span>
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{featuredArticle.title}</h2>
            <p className="text-muted-foreground mb-4">{featuredArticle.description}</p>
            <button className="text-primary font-medium flex items-center gap-1 hover:underline">
              Read Article <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} isDark={isDark} />
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found matching your search.</p>
          </div>
        )}

        {/* Sidebar Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Expert Quote */}
          <div className={`lg:col-span-2 p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                🩺
              </div>
              <div>
                <p className="font-medium mb-2">Dr. Sarah Chen, MD</p>
                <p className="text-sm text-muted-foreground mb-1">Chief Medical Officer</p>
                <blockquote className="italic text-muted-foreground">
                  "Knowledge is the first step to hormonal balance. Search our library or ask a direct question."
                </blockquote>
              </div>
            </div>
          </div>

          {/* Quick Glossary */}
          <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
            <h3 className="font-semibold mb-4">Quick Glossary</h3>
            <div className="space-y-4">
              {glossaryTerms.map((item) => (
                <div key={item.term}>
                  <p className="font-medium text-sm">{item.term}</p>
                  <p className="text-xs text-muted-foreground">{item.definition}</p>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm text-primary hover:underline flex items-center gap-1">
              View A-Z Index <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

interface ArticleCardProps {
  article: Article;
  isDark: boolean;
}

const ArticleCard = ({ article, isDark }: ArticleCardProps) => {
  const categoryColors: Record<string, string> = {
    biology: "bg-blue-500/20 text-blue-500",
    disorders: "bg-red-500/20 text-red-500",
    "birth-control": "bg-purple-500/20 text-purple-500",
    nutrition: "bg-green-500/20 text-green-500",
  };

  return (
    <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'} hover:scale-[1.02] transition-transform cursor-pointer`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[article.category] || 'bg-muted'}`}>
          {article.category.replace("-", " ").toUpperCase()}
        </span>
        <span className="text-xs text-muted-foreground">{article.readTime} read</span>
        {article.reviewed && (
          <span className="text-xs text-muted-foreground">• Reviewed</span>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
      <p className="text-muted-foreground text-sm mb-4">{article.description}</p>
      <button className="text-primary font-medium text-sm flex items-center gap-1 hover:underline">
        Read Article <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Encyclopedia;