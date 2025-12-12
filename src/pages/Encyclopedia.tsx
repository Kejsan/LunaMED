import { useState } from "react";
import { Search, BookOpen, Heart, Shield, UtensilsCrossed, ChevronRight, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { AppLayout } from "@/components/layout/AppLayout";

interface Article {
  id: string;
  titleKey: string;
  descriptionKey: string;
  category: string;
  readTime: string;
  reviewed: boolean;
}

const Encyclopedia = () => {
  const { isCelestial } = useTheme();
  const { t } = useLanguage();
  const isDark = isCelestial;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const articles: Article[] = [
    {
      id: "1",
      titleKey: "articleFourSeasons",
      descriptionKey: "articleFourSeasonsDesc",
      category: "biology",
      readTime: "6",
      reviewed: true,
    },
    {
      id: "2",
      titleKey: "articlePCOS",
      descriptionKey: "articlePCOSDesc",
      category: "disorders",
      readTime: "12",
      reviewed: true,
    },
    {
      id: "3",
      titleKey: "articleSeedCycling",
      descriptionKey: "articleSeedCyclingDesc",
      category: "nutrition",
      readTime: "5",
      reviewed: false,
    },
    {
      id: "4",
      titleKey: "articleEndometriosis",
      descriptionKey: "articleEndometriosisDesc",
      category: "disorders",
      readTime: "8",
      reviewed: true,
    },
    {
      id: "5",
      titleKey: "articleContraceptive",
      descriptionKey: "articleContraceptiveDesc",
      category: "birth-control",
      readTime: "10",
      reviewed: true,
    },
    {
      id: "6",
      titleKey: "articleIronFoods",
      descriptionKey: "articleIronFoodsDesc",
      category: "nutrition",
      readTime: "4",
      reviewed: true,
    },
    {
      id: "7",
      titleKey: "articleGutHormone",
      descriptionKey: "articleGutHormoneDesc",
      category: "biology",
      readTime: "8",
      reviewed: true,
    },
    {
      id: "8",
      titleKey: "articleAmenorrhea",
      descriptionKey: "articleAmenorrheaDesc",
      category: "disorders",
      readTime: "7",
      reviewed: true,
    },
  ];

  const categories = [
    { id: "all", labelKey: "all" as const, icon: BookOpen },
    { id: "biology", labelKey: "biology101" as const, icon: Heart },
    { id: "disorders", labelKey: "disorders" as const, icon: Shield },
    { id: "birth-control", labelKey: "birthControl" as const, icon: Shield },
    { id: "nutrition", labelKey: "nutrition" as const, icon: UtensilsCrossed },
  ];

  const popularTags = ["PCOS", "Endometriosis", "Ovulation", "Sleep"];

  const glossaryTerms = [
    { termKey: "glossaryLutealPhase" as const, definitionKey: "glossaryLutealPhaseDef" as const },
    { termKey: "glossaryProgesterone" as const, definitionKey: "glossaryProgesteroneDef" as const },
    { termKey: "glossaryAmenorrhea" as const, definitionKey: "glossaryAmenorrheaDef" as const },
  ];

  const filteredArticles = articles.filter((article) => {
    const title = t(article.titleKey as any);
    const description = t(article.descriptionKey as any);
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
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
            {isDark ? t("cosmicKnowledgeBase") : t("healthEncyclopedia")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isDark ? t("wisdomForCycle") : t("evidenceBasedInfo")}
          </p>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
          </div>
          
          {/* Popular Tags */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">{t("popular")}:</span>
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
              {t(cat.labelKey)}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {featuredArticle && activeCategory === "all" && !searchQuery && (
          <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'} relative overflow-hidden`}>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
              {t("editorsPick")}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">{t("medicallyReviewed")}</span>
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t(featuredArticle.titleKey as any)}</h2>
            <p className="text-muted-foreground mb-4">{t(featuredArticle.descriptionKey as any)}</p>
            <button className="text-primary font-medium flex items-center gap-1 hover:underline">
              {t("readArticle")} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} isDark={isDark} t={t} />
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("noArticlesFound")}</p>
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
                <p className="text-sm text-muted-foreground mb-1">{t("chiefMedicalOfficer")}</p>
                <blockquote className="italic text-muted-foreground">
                  "{t("expertQuote")}"
                </blockquote>
              </div>
            </div>
          </div>

          {/* Quick Glossary */}
          <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'}`}>
            <h3 className="font-semibold mb-4">{t("quickGlossary")}</h3>
            <div className="space-y-4">
              {glossaryTerms.map((item) => (
                <div key={item.termKey}>
                  <p className="font-medium text-sm">{t(item.termKey)}</p>
                  <p className="text-xs text-muted-foreground">{t(item.definitionKey)}</p>
                </div>
              ))}
            </div>
            <button className="mt-4 text-sm text-primary hover:underline flex items-center gap-1">
              {t("viewAZIndex")} <ChevronRight className="w-4 h-4" />
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
  t: (key: any) => string;
}

const ArticleCard = ({ article, isDark, t }: ArticleCardProps) => {
  const categoryColors: Record<string, string> = {
    biology: "bg-blue-500/20 text-blue-500",
    disorders: "bg-red-500/20 text-red-500",
    "birth-control": "bg-purple-500/20 text-purple-500",
    nutrition: "bg-green-500/20 text-green-500",
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "biology": return t("biology101");
      case "disorders": return t("disorders");
      case "birth-control": return t("birthControl");
      case "nutrition": return t("nutrition");
      default: return category;
    }
  };

  return (
    <div className={`p-6 rounded-2xl ${isDark ? 'glass-dark' : 'glass-light'} hover:scale-[1.02] transition-transform cursor-pointer`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[article.category] || 'bg-muted'}`}>
          {getCategoryLabel(article.category).toUpperCase()}
        </span>
        <span className="text-xs text-muted-foreground">{article.readTime} {t("minRead")}</span>
        {article.reviewed && (
          <span className="text-xs text-muted-foreground">• {t("reviewed")}</span>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">{t(article.titleKey as any)}</h3>
      <p className="text-muted-foreground text-sm mb-4">{t(article.descriptionKey as any)}</p>
      <button className="text-primary font-medium text-sm flex items-center gap-1 hover:underline">
        {t("readArticle")} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Encyclopedia;
