import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "sq";

export const translations = {
  en: {
    // Common
    settings: "Settings",
    save: "Save Changes",
    cancel: "Cancel",
    language: "Language",
    english: "English",
    albanian: "Albanian",
    
    // Landing page
    heroTitle: "Wisdom of the Stars",
    heroSubtitle: "in Every Cycle",
    heroDescription: "Experience the most intuitive period tracking app that aligns your cycle with lunar wisdom. Medical precision meets celestial insight.",
    getStarted: "Begin Your Journey",
    learnMore: "Learn More",
    cycleDay: "Cycle Day",
    moonPhase: "Moon Phase",
    waxingGibbous: "Waxing Gibbous",
    features: "Features",
    medicalReports: "Medical Reports",
    medicalReportsDesc: "Generate comprehensive health reports with cycle analytics",
    aiCycle: "AI Cycle",
    aiCycleDesc: "Intelligent predictions powered by your unique patterns",
    lunarAlignment: "Lunar Alignment",
    lunarAlignmentDesc: "Sync your cycle with moon phases for deeper insights",
    privacy: "Your Privacy, Protected",
    privacyDesc: "GDPR & HIPAA compliant. Your health data belongs to you—always encrypted, never sold.",
    testimonials: "What Our Users Say",
    
    // Auth
    welcomeBack: "Welcome back",
    createAccount: "Create Account",
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot password?",
    orContinueWith: "Or continue with",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    agreeTerms: "I agree to the Terms of Service and Privacy Policy",
    consentHealth: "I consent to the processing of my health data",
    
    // Dashboard
    dashboard: "Dashboard",
    todayPrediction: "Today's Prediction",
    cyclePhase: "Cycle Phase",
    daysUntilPeriod: "Days until period",
    fertilityWindow: "Fertility Window",
    lunarWisdom: "Lunar Wisdom",
    logSymptoms: "Log Symptoms",
    viewCalendar: "View Calendar",
    
    // Settings
    profile: "Profile",
    cycle: "Cycle",
    privacySettings: "Privacy",
    displayName: "Display Name",
    averageCycleLength: "Average Cycle Length (days)",
    averagePeriodLength: "Average Period Length (days)",
    periodReminders: "Period Reminders",
    remindDaysBefore: "Remind me (days before)",
    ovulationReminders: "Ovulation Reminders",
    notifyFertileWindow: "Get notified during fertile window",
    dataRights: "Your Data Rights (GDPR)",
    dataRightsDesc: "You have the right to access, export, and delete your data at any time.",
    analyticsImprovement: "Analytics & Improvement",
    analyticsDesc: "Help improve LunaMed with anonymous usage data",
    
    // Navigation
    home: "Home",
    calendar: "Calendar",
    logger: "Logger",
    insights: "Insights",
    analytics: "Analytics",
    reports: "Reports",
    encyclopedia: "Encyclopedia",
  },
  sq: {
    // Common
    settings: "Cilësimet",
    save: "Ruaj Ndryshimet",
    cancel: "Anulo",
    language: "Gjuha",
    english: "Anglisht",
    albanian: "Shqip",
    
    // Landing page
    heroTitle: "Urtësia e Yjeve",
    heroSubtitle: "në Çdo Cikël",
    heroDescription: "Përjetoni aplikacionin më intuitiv të ndjekjes së ciklit që harmonizon ciklin tuaj me urtësinë hënore. Saktësia mjekësore takon njohjen qiellore.",
    getStarted: "Fillo Udhëtimin",
    learnMore: "Mëso Më Shumë",
    cycleDay: "Dita e Ciklit",
    moonPhase: "Faza e Hënës",
    waxingGibbous: "Hëna në Rritje",
    features: "Veçoritë",
    medicalReports: "Raportet Mjekësore",
    medicalReportsDesc: "Gjeneroni raporte të plota shëndetësore me analiza të ciklit",
    aiCycle: "Cikli AI",
    aiCycleDesc: "Parashikime inteligjente të mundësuara nga modelet tuaja unike",
    lunarAlignment: "Harmonizimi Hënor",
    lunarAlignmentDesc: "Sinkronizoni ciklin tuaj me fazat e hënës për njohuri më të thella",
    privacy: "Privatësia Juaj, e Mbrojtur",
    privacyDesc: "Në përputhje me GDPR & HIPAA. Të dhënat tuaja shëndetësore janë tuajat—gjithmonë të koduara, kurrë të shitura.",
    testimonials: "Çfarë Thonë Përdoruesit Tanë",
    
    // Auth
    welcomeBack: "Mirësevini përsëri",
    createAccount: "Krijo Llogari",
    signIn: "Kyçu",
    signUp: "Regjistrohu",
    email: "Email",
    password: "Fjalëkalimi",
    confirmPassword: "Konfirmo Fjalëkalimin",
    forgotPassword: "Harruat fjalëkalimin?",
    orContinueWith: "Ose vazhdo me",
    noAccount: "Nuk keni llogari?",
    hasAccount: "Keni tashmë një llogari?",
    agreeTerms: "Pranoj Kushtet e Shërbimit dhe Politikën e Privatësisë",
    consentHealth: "Jap pëlqimin për përpunimin e të dhënave të mia shëndetësore",
    
    // Dashboard
    dashboard: "Paneli",
    todayPrediction: "Parashikimi i Sotëm",
    cyclePhase: "Faza e Ciklit",
    daysUntilPeriod: "Ditë deri në periudhë",
    fertilityWindow: "Dritarja e Fertilitetit",
    lunarWisdom: "Urtësia Hënore",
    logSymptoms: "Regjistro Simptomat",
    viewCalendar: "Shiko Kalendarin",
    
    // Settings
    profile: "Profili",
    cycle: "Cikli",
    privacySettings: "Privatësia",
    displayName: "Emri i Shfaqur",
    averageCycleLength: "Gjatësia Mesatare e Ciklit (ditë)",
    averagePeriodLength: "Gjatësia Mesatare e Periudhës (ditë)",
    periodReminders: "Kujtuesit e Periudhës",
    remindDaysBefore: "Më kujto (ditë para)",
    ovulationReminders: "Kujtuesit e Ovulacionit",
    notifyFertileWindow: "Njoftohu gjatë dritares së fertilitetit",
    dataRights: "Të Drejtat e të Dhënave (GDPR)",
    dataRightsDesc: "Keni të drejtë të aksesoni, eksportoni dhe fshini të dhënat tuaja në çdo kohë.",
    analyticsImprovement: "Analitika & Përmirësimi",
    analyticsDesc: "Ndihmoni të përmirësojmë LunaMed me të dhëna anonime përdorimi",
    
    // Navigation
    home: "Kryefaqja",
    calendar: "Kalendari",
    logger: "Regjistruesi",
    insights: "Njohuritë",
    analytics: "Analitika",
    reports: "Raportet",
    encyclopedia: "Enciklopedia",
  },
} as const;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("lunamed-language");
    return (stored as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("lunamed-language", language);
  }, [language]);

  const t = (key: keyof typeof translations.en): string => {
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