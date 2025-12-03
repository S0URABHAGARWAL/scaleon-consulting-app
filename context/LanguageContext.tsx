
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Country, NumberingSystem } from '../types';

// --- DATASETS ---

const LANG_EN: Language = { code: 'en-US', name: 'English', nativeName: 'English' };
const LANG_HI: Language = { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' };
const LANG_ES: Language = { code: 'es', name: 'Spanish', nativeName: 'Español' };
const LANG_FR: Language = { code: 'fr', name: 'French', nativeName: 'Français' };
const LANG_DE: Language = { code: 'de', name: 'German', nativeName: 'Deutsch' };
const LANG_AR: Language = { code: 'ar', name: 'Arabic', nativeName: 'العربية' };
const LANG_ZH: Language = { code: 'zh', name: 'Mandarin', nativeName: '中文' };

export const getLanguageFlag = (code: string): string => {
  if (code.startsWith('en')) return '🇬🇧'; 
  if (code.startsWith('hi')) return '🇮🇳';
  if (code.startsWith('es')) return '🇪🇸';
  if (code.startsWith('fr')) return '🇫🇷';
  if (code.startsWith('de')) return '🇩🇪';
  if (code.startsWith('ar')) return '🇸🇦';
  if (code.startsWith('zh')) return '🇨🇳';
  return '🌐';
};

export const COUNTRIES: Country[] = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: { code: 'USD', symbol: '$', name: 'US Dollar' },
    numberingSystem: 'international',
    languages: [LANG_EN, LANG_ES]
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    numberingSystem: 'indian',
    languages: [LANG_EN, LANG_HI] 
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: { code: 'GBP', symbol: '£', name: 'British Pound' },
    numberingSystem: 'international',
    languages: [LANG_EN]
  },
  {
    code: 'EU',
    name: 'Europe (Eurozone)',
    flag: '🇪🇺',
    currency: { code: 'EUR', symbol: '€', name: 'Euro' },
    numberingSystem: 'international',
    languages: [LANG_EN, LANG_FR, LANG_DE, LANG_ES]
  },
  {
    code: 'AE',
    name: 'UAE',
    flag: '🇦🇪',
    currency: { code: 'AED', symbol: 'dh', name: 'Dirham' },
    numberingSystem: 'international',
    languages: [LANG_EN, LANG_AR]
  },
  {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    currency: { code: 'CNY', symbol: '¥', name: 'Yuan' },
    numberingSystem: 'international',
    languages: [LANG_ZH, LANG_EN]
  }
];

// --- TRANSLATION DICTIONARY ---

const DICTIONARY: Record<string, Record<string, string>> = {
  'en-US': {
    // Header
    'header_upload_text': 'Upload',
    'tooltip_upload_logo': 'Click to upload your company logo',
    
    // Stepper
    'step_input': 'Digital Footprint',
    'step_confirm': 'Company Profile',
    'step_taxonomy': 'Market Context',
    'step_questions': 'Strategy Audit',
    'step_contact': 'Finalize',
    'tracker_current_phase': 'Current Phase',
    'tracker_elapsed': 'Elapsed',
    'tracker_est_remain': 'Est. Remain',
    
    // Discovery Wizard
    'title_input': 'Start with your Digital Footprint',
    'desc_input': 'Enter your Company Name or Website. Our AI agents will research your public presence.',
    'placeholder_input': 'e.g. Acme Corp or linkedin.com/company/acme',
    'btn_analyze': 'Analyze',
    'btn_scanning': 'Scanning...',
    'btn_review': 'Review & Continue',
    'btn_skip': 'Skip enrichment',
    'btn_next': 'Next',
    'btn_back': 'Back',
    'btn_submit': 'Reveal Report',

    'label_company': 'Company Name',
    'label_website': 'Website',
    'label_employees': 'Employees',
    'label_revenue': 'Est. Revenue',
    'label_industry': 'Industry',
    'label_sub_industry': 'Sub-Industry',
    'label_niche': 'Niche',
    
    'msg_research_complete': 'Research Complete.',
    'msg_active_channels': 'Active Channels',
    'msg_generating': 'Consultant AI is drafting your audit...',
    
    'opt_select_industry': 'Select Industry...',
    'opt_select_sub': 'Select Sub-Industry...',
    'opt_select_niche': 'Select Niche...',

    // Contact Form
    'label_name': 'Full Name',
    'label_email': 'Work Email',
    'label_title': 'Job Title',

    // Report View
    'report_title': 'Deep Discovery Report',
    'report_subtitle': 'Prepared for',
    'lbl_generated_date': 'Generated on',
    
    'section_exec_summary': 'Executive Summary',
    'section_market_analysis': 'Market Opportunity',
    'section_competitors': 'Competitive Landscape',
    'section_swot': 'SWOT Analysis',
    'section_roadmap': 'Growth Roadmap',
    'section_ai_tools': 'AI & Automation',
    'section_risks': 'Risk Assessment',
    'section_financials': 'Financial Projections',
    
    'lbl_key_strengths': 'Key Strengths',
    'lbl_crit_gaps': 'Critical Gaps',
    'lbl_market_size_viz': 'Market Size Visualization',
    'lbl_score_title': 'Strategy Audit Score',
    
    'btn_save_pdf': 'Save as PDF',
    'btn_book_call': 'Book Strategy Call',
    'btn_export_docx': 'Export DOCX',
    'btn_export_ppt': 'Export PPT',
    'btn_generate_visuals': 'Visualize',
    'btn_visuals_loading': 'Designing...',
    
    'msg_thank_you': 'Thank You',
    'msg_report_generated': 'Your Strategic Discovery Report has been generated.',
    'msg_return_home': 'Return to Home',

    // Tooltips
    'tooltip_tam': 'Total Addressable Market: The overall revenue opportunity available if 100% market share is achieved.',
    'tooltip_sam': 'Serviceable Addressable Market: The segment of the TAM targeted by your products and services.',
    'tooltip_som': 'Serviceable Obtainable Market: The portion of SAM that you can realistically capture.',
    'tooltip_health_score': 'Overall strategic health based on financials, operations, and market position.',
    'tooltip_market_opp': 'Potential for growth and expansion in your specific niche.',
    'tooltip_social_health': 'Digital presence effectiveness across key social platforms.',
    'tooltip_web_perf': 'Website technical performance, SEO, and user conversion capability.',
    'tooltip_roadmap': 'A phased approach to achieving your strategic goals over the next 12 months.',
    'tooltip_ai_tools': 'Recommended tools to automate processes and improve efficiency based on your industry.',
  },
  'hi': {
    'header_upload_text': 'अपलोड',
    'tooltip_upload_logo': 'अपना कंपनी लोगो अपलोड करें',

    'step_input': 'डिजिटल उपस्थिति',
    'step_confirm': 'कंपनी प्रोफाइल',
    'step_taxonomy': 'बाजार संदर्भ',
    'step_questions': 'रणनीति ऑडिट',
    'step_contact': 'संपर्क विवरण',
    'tracker_current_phase': 'वर्तमान चरण',
    'tracker_elapsed': 'बीता हुआ',
    'tracker_est_remain': 'अनुमानित शेष',

    'title_input': 'अपनी डिजिटल उपस्थिति से शुरुआत करें',
    'desc_input': 'अपनी कंपनी का नाम या वेबसाइट दर्ज करें। हमारी एआई आपके सार्वजनिक डेटा का शोध करेगी।',
    'placeholder_input': 'जैसे: Acme Corp या linkedin.com/company/acme',
    'btn_analyze': 'विश्लेषण करें',
    'btn_scanning': 'स्कैनिंग...',
    'btn_review': 'समीक्षा करें और जारी रखें',
    'btn_skip': 'एनरिचमेंट छोड़ें',
    'btn_next': 'अगला',
    'btn_back': 'पीछे',
    'btn_submit': 'रिपोर्ट देखें',

    'label_company': 'कंपनी का नाम',
    'label_website': 'वेबसाइट',
    'label_employees': 'कर्मचारी',
    'label_revenue': 'अनुमानित राजस्व',
    'label_industry': 'उद्योग',
    'label_sub_industry': 'उप-उद्योग',
    'label_niche': 'विशिष्ट श्रेणी',

    'msg_research_complete': 'शोध पूरा हुआ।',
    'msg_active_channels': 'सक्रिय चैनल',
    'msg_generating': 'कंसल्टेंट एआई आपका ऑडिट तैयार कर रहा है...',
    
    'opt_select_industry': 'उद्योग चुनें...',
    'opt_select_sub': 'उप-उद्योग चुनें...',
    'opt_select_niche': 'श्रेणी चुनें...',

    'label_name': 'पूरा नाम',
    'label_email': 'कार्य ईमेल',
    'label_title': 'पद',

    'report_title': 'डीप डिस्कवरी रिपोर्ट',
    'report_subtitle': 'के लिए तैयार',
    'lbl_generated_date': 'तैयार की गई',
    
    'section_exec_summary': 'कार्यकारी सारांश',
    'section_market_analysis': 'बाजार अवसर',
    'section_competitors': 'प्रतिस्पर्धी परिदृश्य',
    'section_swot': 'SWOT विश्लेषण',
    'section_roadmap': 'विकास रोडमैप',
    'section_ai_tools': 'एआई और स्वचालन',
    'section_risks': 'जोखिम मूल्यांकन',
    'section_financials': 'वित्तीय अनुमान',

    'lbl_key_strengths': 'मुख्य ताकत',
    'lbl_crit_gaps': 'महत्वपूर्ण कमियां',
    'lbl_market_size_viz': 'बाजार आकार दृश्य',
    'lbl_score_title': 'रणनीति ऑडिट स्कोर',
    
    'btn_save_pdf': 'PDF के रूप में सहेजें',
    'btn_book_call': 'स्ट्रेटेजी कॉल बुक करें',
    'btn_export_docx': 'DOCX निर्यात करें',
    'btn_export_ppt': 'PPT निर्यात करें',
    'btn_generate_visuals': 'दृश्य बनाएं',
    'btn_visuals_loading': 'डिजाइनिंग...',

    'msg_thank_you': 'धन्यवाद',
    'msg_report_generated': 'आपकी रणनीतिक डिस्कवरी रिपोर्ट तैयार हो गई है।',
    'msg_return_home': 'होम पर लौटें',

    'tooltip_tam': 'कुल पता योग्य बाजार: 100% बाजार हिस्सेदारी प्राप्त होने पर उपलब्ध कुल राजस्व अवसर।',
    'tooltip_sam': 'सेवा योग्य पता योग्य बाजार: आपके उत्पादों और सेवाओं द्वारा लक्षित TAM का खंड।',
    'tooltip_som': 'सेवा योग्य प्राप्त बाजार: SAM का वह हिस्सा जिसे आप वास्तविक रूप से कैप्चर कर सकते हैं।',
    'tooltip_health_score': 'वित्तीय, संचालन और बाजार की स्थिति पर आधारित समग्र रणनीतिक स्वास्थ्य।',
    'tooltip_market_opp': 'आपकी विशिष्ट श्रेणी में विकास और विस्तार की क्षमता।',
    'tooltip_social_health': 'प्रमुख सामाजिक प्लेटफार्मों पर डिजिटल उपस्थिति की प्रभावशीलता।',
    'tooltip_web_perf': 'वेबसाइट तकनीकी प्रदर्शन, एसईओ, और उपयोगकर्ता रूपांतरण क्षमता।',
    'tooltip_roadmap': 'अगले 12 महीनों में अपने रणनीतिक लक्ष्यों को प्राप्त करने के लिए चरणबद्ध दृष्टिकोण।',
    'tooltip_ai_tools': 'अपने उद्योग के आधार पर प्रक्रियाओं को स्वचालित करने और दक्षता में सुधार करने के लिए अनुशंसित उपकरण।',
  }
};

interface LanguageContextType {
  currentCountry: Country;
  setCountry: (country: Country) => void;
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number | string) => string;
  formatNumber: (amount: number | string) => string;
  getLanguageFlag: (code: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCountry, setCurrentCountry] = useState<Country>(COUNTRIES[0]); 
  const [currentLanguage, setCurrentLanguage] = useState<Language>(COUNTRIES[0].languages[0]); 

  useEffect(() => {
    const savedCountryCode = localStorage.getItem('scaleon_country_code');
    const savedLangCode = localStorage.getItem('scaleon_lang_code');
    
    if (savedCountryCode) {
      const country = COUNTRIES.find(c => c.code === savedCountryCode);
      if (country) {
        setCurrentCountry(country);
        if (savedLangCode) {
            const validLang = country.languages.find(l => l.code === savedLangCode);
            if (validLang) setCurrentLanguage(validLang);
            else setCurrentLanguage(country.languages[0]);
        } else {
            setCurrentLanguage(country.languages[0]);
        }
      }
    }
  }, []);

  const handleSetCountry = (country: Country) => {
    setCurrentCountry(country);
    const defaultLang = country.languages[0];
    setCurrentLanguage(defaultLang);
    localStorage.setItem('scaleon_country_code', country.code);
    localStorage.setItem('scaleon_lang_code', defaultLang.code);
  };

  const handleSetLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('scaleon_lang_code', lang.code);
  };

  const t = (key: string) => {
    const dict = DICTIONARY[currentLanguage.code] || DICTIONARY['en-US'];
    return dict[key] || DICTIONARY['en-US'][key] || key;
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g,"")) : amount;
    if (isNaN(num)) return amount.toString();

    if (currentCountry.numberingSystem === 'indian') {
        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currentCountry.currency.code,
            maximumFractionDigits: 0
        });
        return formatter.format(num);
    } 
    
    const formatter = new Intl.NumberFormat(currentLanguage.code, {
        style: 'currency',
        currency: currentCountry.currency.code,
        maximumFractionDigits: 0
    });
    return formatter.format(num);
  };

  const formatNumber = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g,"")) : amount;
    if (isNaN(num)) return amount.toString();

    const locale = currentCountry.numberingSystem === 'indian' ? 'en-IN' : currentLanguage.code;
    return new Intl.NumberFormat(locale).format(num);
  };

  return (
    <LanguageContext.Provider value={{ 
        currentCountry, 
        setCountry: handleSetCountry, 
        currentLanguage, 
        setLanguage: handleSetLanguage, 
        t,
        formatCurrency,
        formatNumber,
        getLanguageFlag
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
