import { createContext, ReactNode, useContext, useState, useEffect } from "react";

type Language = "en" | "fr" | "ar";

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.providers": "Providers",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.logout": "Logout",
    "nav.dashboard": "Dashboard",
    "hero.title": "Find Local Professionals You Can Trust",
    "hero.subtitle": "Connecting you with the best service providers in your city.",
    "hero.cta": "Get Started",
    "search.placeholder": "What service do you need?",
    "footer.rights": "All rights reserved.",
    "booking.success": "Booking request sent successfully!",
    "provider.contact": "Contact",
    "provider.book": "Book Now",
    "status.pending": "Pending",
    "status.accepted": "Accepted",
    "status.completed": "Completed",
    "status.cancelled": "Cancelled",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.services": "Services",
    "nav.providers": "Prestataires",
    "nav.login": "Connexion",
    "nav.register": "Inscription",
    "nav.logout": "Déconnexion",
    "nav.dashboard": "Tableau de bord",
    "hero.title": "Trouvez des professionnels locaux de confiance",
    "hero.subtitle": "Nous vous connectons avec les meilleurs prestataires de votre ville.",
    "hero.cta": "Commencer",
    "search.placeholder": "De quel service avez-vous besoin ?",
    "footer.rights": "Tous droits réservés.",
    "booking.success": "Demande de réservation envoyée avec succès !",
    "provider.contact": "Contacter",
    "provider.book": "Réserver",
    "status.pending": "En attente",
    "status.accepted": "Accepté",
    "status.completed": "Terminé",
    "status.cancelled": "Annulé",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.services": "الخدمات",
    "nav.providers": "مقدمي الخدمات",
    "nav.login": "دخول",
    "nav.register": "تسجيل",
    "nav.logout": "خروج",
    "nav.dashboard": "لوحة التحكم",
    "hero.title": "اعثر على محترفين محليين موثوق بهم",
    "hero.subtitle": "نربطك بأفضل مقدمي الخدمات في مدينتك.",
    "hero.cta": "ابدأ الآن",
    "search.placeholder": "ما هي الخدمة التي تحتاجها؟",
    "footer.rights": "جميع الحقوق محفوظة.",
    "booking.success": "تم إرسال طلب الحجز بنجاح!",
    "provider.contact": "اتصل",
    "provider.book": "احجز الآن",
    "status.pending": "قيد الانتظار",
    "status.accepted": "مقبول",
    "status.completed": "مكتمل",
    "status.cancelled": "ملغى",
  }
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const dir = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
