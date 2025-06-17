"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppFont } from '@/types';
import { useRouter } from 'next/navigation';

interface FontContextType {
  font: AppFont;
  setFont: (font: AppFont) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: ReactNode }) {
  const [font, setFont] = useState<AppFont>('proxima-nova');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Load font preference from local storage
    const storedFont = localStorage.getItem('app-font');
    if (storedFont === 'inter' || storedFont === 'comic-sans' || storedFont === 'proxima-nova') {
      setFont(storedFont as AppFont);
    } else {
      setFont('proxima-nova'); // Default
    }
  }, []);

  // Effect to apply the font to the document element and save to local storage
  useEffect(() => {
    if (!mounted) return; // Ensure component is mounted before accessing document
    
    const htmlElement = document.documentElement;
    let fontVariableValue = 'var(--font-proxima-nova)'; // Default
    let fontFamilyValue = 'var(--font-proxima-nova)'; // Default

    if (font === 'inter') {
      fontVariableValue = 'var(--font-inter)';
      fontFamilyValue = 'Inter, sans-serif';
    } else if (font === 'comic-sans') {
      fontVariableValue = 'var(--font-comic-sans)';
      fontFamilyValue = '"Comic Sans MS", "Comic Neue", cursive';
    } else {
      fontFamilyValue = '"Proxima Nova", sans-serif';
    }
    
    htmlElement.style.setProperty('--app-font', fontVariableValue);
    document.body.style.fontFamily = fontFamilyValue;
    localStorage.setItem('app-font', font);
  }, [font, mounted]);

  return (
    <FontContext.Provider value={{ font, setFont }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  const router = useRouter();
  
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider');
  }
  
  // Create a wrapped setFont function that also triggers a refresh
  const setFontWithRefresh = (newFont: AppFont) => {
    // First set the font in localStorage directly
    localStorage.setItem('app-font', newFont);
    
    // Then update the context state
    context.setFont(newFont);
    
    // Force a hard refresh of the page
    window.location.reload();
  };
  
  return {
    font: context.font,
    setFont: setFontWithRefresh
  };
}
