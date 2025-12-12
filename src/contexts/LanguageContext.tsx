import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, type Language, type TranslationKey } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("lunamed-language");
    return (stored as Language) || "en";
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch language preference from database when user logs in
  useEffect(() => {
    const fetchLanguagePreference = async () => {
      if (user && !isInitialized) {
        const { data } = await supabase
          .from("user_settings")
          .select("language_preference")
          .eq("user_id", user.id)
          .single();
        
        if (data?.language_preference) {
          const dbLanguage = data.language_preference as Language;
          setLanguageState(dbLanguage);
          localStorage.setItem("lunamed-language", dbLanguage);
        }
        setIsInitialized(true);
      }
    };

    fetchLanguagePreference();
  }, [user, isInitialized]);

  // Reset initialization when user logs out
  useEffect(() => {
    if (!user) {
      setIsInitialized(false);
    }
  }, [user]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lunamed-language", lang);

    // Sync to database if user is logged in
    if (user) {
      await supabase
        .from("user_settings")
        .update({ language_preference: lang })
        .eq("user_id", user.id);
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Re-export types for convenience
export type { Language, TranslationKey };
