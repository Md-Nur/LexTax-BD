import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANG_KEY = '@lextax_language';

export type Language = 'en' | 'bn';

const translations: Record<string, Record<Language, string>> = {
  // Profile page
  'profile.title': { en: 'Profile & Settings', bn: 'প্রোফাইল ও সেটিংস' },
  'profile.memberSince': { en: 'Member since', bn: 'সদস্য হয়েছেন' },
  'profile.role.admin': { en: 'Admin', bn: 'অ্যাডমিন' },
  'profile.role.user': { en: 'User', bn: 'ব্যবহারকারী' },

  // Settings sections
  'settings.appearance': { en: 'Appearance', bn: 'থিম' },
  'settings.darkMode': { en: 'Dark Mode', bn: 'ডার্ক মোড' },
  'settings.darkModeDesc': { en: 'Switch between light and dark theme', bn: 'লাইট এবং ডার্ক থিম পরিবর্তন করুন' },
  'settings.language': { en: 'Language', bn: 'ভাষা' },
  'settings.languageDesc': { en: 'Choose your preferred language', bn: 'আপনার পছন্দের ভাষা নির্বাচন করুন' },

  // Navigation
  'nav.adminPanel': { en: 'Admin Panel', bn: 'অ্যাডমিন প্যানেল' },
  'nav.adminPanelDesc': { en: 'Manage documents and users', bn: 'ডকুমেন্ট এবং ব্যবহারকারী পরিচালনা করুন' },
  'nav.faq': { en: 'FAQ', bn: 'সাধারণ জিজ্ঞাসা' },
  'nav.support': { en: 'Support', bn: 'সাহায্য' },
  'nav.supportDesc': { en: 'Need help? Contact us', bn: 'সাহায্য প্রয়োজন? যোগাযোগ করুন' },
  'nav.aboutUs': { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
  'nav.aboutUsDesc': { en: 'Learn more about LexTax BD', bn: 'LexTax BD সম্পর্কে আরও জানুন' },
  'nav.signOut': { en: 'Sign Out', bn: 'সাইন আউট' },

  // FAQ
  'faq.q1': { en: 'What is LexTax BD?', bn: 'LexTax BD কী?' },
  'faq.a1': {
    en: 'LexTax BD is a comprehensive legal reference app for Bangladesh tax laws including Income Tax, VAT, and Customs regulations.',
    bn: 'LexTax BD বাংলাদেশের কর-সম্পর্কিত আইন যেমন আয়কর, ভ্যাট এবং শুল্ক সংক্রান্ত আইনের একটি ব্যাপক আইনি রেফারেন্স অ্যাপ।',
  },
  'faq.q2': { en: 'How do I bookmark a document?', bn: 'কীভাবে একটি ডকুমেন্ট বুকমার্ক করব?' },
  'faq.a2': {
    en: 'Open any document and tap the bookmark icon in the top right corner to save it for later.',
    bn: 'যেকোনো ডকুমেন্ট খুলুন এবং পরে সেভ করতে উপরের ডান কোণে বুকমার্ক আইকনে ট্যাপ করুন।',
  },
  'faq.q3': { en: 'Is the content available offline?', bn: 'কনটেন্ট কি অফলাইনে পাওয়া যায়?' },
  'faq.a3': {
    en: 'Currently, an internet connection is required to access the latest documents. Offline support is planned for future updates.',
    bn: 'বর্তমানে, সর্বশেষ ডকুমেন্ট অ্যাক্সেস করতে ইন্টারনেট সংযোগ প্রয়োজন। ভবিষ্যতে অফলাইন সাপোর্ট যুক্ত করার পরিকল্পনা রয়েছে।',
  },
  'faq.q4': { en: 'How often is the content updated?', bn: 'কত ঘন ঘন কনটেন্ট আপডেট হয়?' },
  'faq.a4': {
    en: 'We update our legal database regularly to reflect the latest amendments and new regulations published by the government.',
    bn: 'সরকার কর্তৃক প্রকাশিত সর্বশেষ সংশোধনী এবং নতুন প্রবিধান প্রতিফলিত করতে আমরা নিয়মিত আমাদের আইনি ডেটাবেস আপডেট করি।',
  },

  // Support
  'support.email': { en: 'Email', bn: 'ইমেইল' },
  'support.emailValue': { en: 'support@lextaxbd.com', bn: 'support@lextaxbd.com' },
  'support.responseTime': { en: 'We typically respond within 24 hours', bn: 'আমরা সাধারণত ২৪ ঘন্টার মধ্যে উত্তর দিই' },

  // About
  'about.title': { en: 'About Us', bn: 'আমাদের সম্পর্কে' },
  'about.appName': { en: 'LexTax BD', bn: 'LexTax BD' },
  'about.version': { en: 'Version 1.0.0', bn: 'সংস্করণ ১.০.০' },
  'about.description': {
    en: 'Your comprehensive legal reference for Bangladesh tax laws.',
    bn: 'বাংলাদেশের কর আইনের জন্য আপনার ব্যাপক আইনি রেফারেন্স।',
  },
  'about.mission': { en: 'Our Mission', bn: 'আমাদের লক্ষ্য' },
  'about.missionText': {
    en: 'LexTax BD aims to make Bangladesh tax laws accessible to everyone — from professionals and businesses to individual citizens. We believe that understanding tax law should not require expensive legal consultations.',
    bn: 'LexTax BD বাংলাদেশের কর আইনকে সকলের কাছে সহজলভ্য করতে চায় — পেশাদার ও ব্যবসায়ীদের থেকে শুরু করে সাধারণ নাগরিক পর্যন্ত। আমরা বিশ্বাস করি কর আইন বোঝার জন্য ব্যয়বহুল আইনি পরামর্শের প্রয়োজন হওয়া উচিত নয়।',
  },
  'about.features': { en: 'Key Features', bn: 'প্রধান বৈশিষ্ট্য' },
  'about.feature1': { en: 'Complete Income Tax, VAT & Customs law database', bn: 'সম্পূর্ণ আয়কর, ভ্যাট ও শুল্ক আইনের ডেটাবেস' },
  'about.feature2': { en: 'Regular updates with latest amendments', bn: 'সর্বশেষ সংশোধনীসহ নিয়মিত আপডেট' },
  'about.feature3': { en: 'Powerful search across all documents', bn: 'সকল ডকুমেন্টে শক্তিশালী অনুসন্ধান' },
  'about.feature4': { en: 'Bookmark and organize your references', bn: 'আপনার রেফারেন্স বুকমার্ক ও সংগঠিত করুন' },
  'about.legal': { en: 'Legal', bn: 'আইনি তথ্য' },
  'about.legalText': {
    en: 'This app provides legal documents for informational purposes only. It does not constitute legal advice. Always consult a qualified legal professional for specific legal matters.',
    bn: 'এই অ্যাপটি শুধুমাত্র তথ্যগত উদ্দেশ্যে আইনি ডকুমেন্ট সরবরাহ করে। এটি আইনি পরামর্শ নয়। নির্দিষ্ট আইনি বিষয়ে সর্বদা একজন যোগ্য আইন পেশাদারের সাথে পরামর্শ করুন।',
  },
  'about.copyright': { en: '© 2026 LexTax BD. All rights reserved.', bn: '© ২০২৬ LexTax BD। সর্বস্বত্ব সংরক্ষিত।' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLang] = useState<Language>('en');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((value) => {
      if (value === 'bn' || value === 'en') setLang(value);
    });
  }, []);

  const setLanguage = (lang: Language) => {
    setLang(lang);
    AsyncStorage.setItem(LANG_KEY, lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
