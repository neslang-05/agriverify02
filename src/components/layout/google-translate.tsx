'use client';

import * as React from 'react';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

// Bhashini-inspired language configuration
const languages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'mni-Mtei', label: 'Meetei Mayek', native: 'ꯃꯤꯇꯩ ꯃꯌꯦꯛ' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'lus', label: 'Mizo', native: 'Mizo ṭawng' },
];

export function GoogleTranslate() {
  const [currentLang, setCurrentLang] = React.useState('en');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const googtrans = getCookie('googtrans');
    if (googtrans) {
      const lang = googtrans.split('/').pop();
      if (lang) {
        // Handle special case for our custom code
        if (lang === 'mni-Mtei') setCurrentLang('mni-Mtei');
        else setCurrentLang(lang);
      }
    }

    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'en',
          autoDisplay: false,
        }, 'google_translate_element_hidden');
      };
    }

    // Mutation Observer to aggressively hide Google's injected elements
    const cleanup = () => {
      const selectors = [
        '.goog-te-banner-frame',
        '.VIpgJd-Zvi9ab-ORHb-nS1dov',
        'iframe.skiptranslate',
        '.goog-te-spinner-pos',
        '#goog-gt-tt',
        '.goog-tooltip',
        '.goog-te-balloon-frame'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          (el as HTMLElement).style.display = 'none';
          (el as HTMLElement).style.visibility = 'hidden';
          (el as HTMLElement).style.opacity = '0';
        });
      });

      if (document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
    };

    const observer = new MutationObserver(cleanup);
    observer.observe(document.body, { childList: true, subtree: true });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    // Also run on an interval as a fallback
    const interval = setInterval(cleanup, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const handleTranslate = (langCode: string) => {
    // Standard Google Translate cookie format: /en/lang
    const cookieValue = `/en/${langCode}`;
    const domain = window.location.hostname;
    
    // Clear existing cookies first
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;

    // Set new cookies
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}`;
    
    // Force reload to apply translation
    window.location.reload();
  };

  if (!mounted) return null;

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="flex items-center notranslate">
      <div id="google_translate_element_hidden" className="hidden"></div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 lg:h-10 px-3 flex items-center gap-2 border-neutral-200 bg-white hover:bg-neutral-50 rounded-lg shadow-sm group transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 font-bold text-sm lg:text-base">अA</span>
              <span className="text-[13px] font-medium text-neutral-700 hidden sm:inline">
                {currentLanguage.native}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-neutral-400 group-data-[state=open]:rotate-180 transition-transform" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 max-h-[420px] overflow-y-auto rounded-xl p-1.5 shadow-2xl border-neutral-200 bg-white z-[9999]">
          <div className="px-2.5 py-2 text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center justify-between">
            <span>Select Language</span>
            <Languages className="h-3.5 w-3.5" />
          </div>
          <DropdownMenuSeparator className="my-1.5 bg-neutral-100" />
          <div className="grid grid-cols-1 gap-0.5">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-lg transition-all m-0.5",
                  currentLang === lang.code 
                    ? "bg-emerald-50 text-emerald-800 font-semibold" 
                    : "hover:bg-neutral-100 text-neutral-700"
                )}
                onClick={() => handleTranslate(lang.code)}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm">{lang.native}</span>
                  <span className="text-[10px] text-neutral-500 font-medium">{lang.label}</span>
                </div>
                {currentLang === lang.code && (
                  <div className="bg-emerald-100 p-1 rounded-full">
                    <Check className="h-3 w-3 text-emerald-700" />
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator className="my-1.5 bg-neutral-100" />
          <div className="px-3 py-2.5 flex items-center justify-center gap-2 bg-neutral-50 rounded-lg mx-0.5 mb-0.5">
             <div className="flex items-center gap-2 grayscale opacity-70">
                <img src="https://bhashini.gov.in/img/logo.png" alt="Bhashini" className="h-4 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                <span className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider">Powered by Google Translate</span>
             </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Complete elimination of Google Translate UI */
        #google_translate_element,
        .goog-te-banner-frame,
        .goog-te-banner-frame.skiptranslate,
        .goog-te-banner,
        .goog-tooltip,
        .goog-te-balloon-frame,
        #goog-gt-tt,
        .goog-te-spinner-pos,
        .VIpgJd-Zvi9ab-ORHb-nS1dov,
        .goog-te-menu-value img,
        .goog-te-gadget-icon,
        .goog-te-menu-frame,
        #google_translate_element_hidden,
        .goog-te-spinner-animation,
        .goog-te-spinner-pos,
        iframe[id=":1.container"],
        iframe[id=":0.container"],
        iframe.goog-te-menu-frame {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          width: 0 !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        body {
          top: 0 !important;
          position: static !important;
        }

        html, body {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }

        /* Prevent Google from shifting the page down */
        .skiptranslate {
          display: none !important;
        }
        body, * {
          font-family: var(--font-inter), var(--font-meetei-mayek), sans-serif !important;
        }
      ` }} />
    </div>
  );
}
