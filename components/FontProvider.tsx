"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppFont } from '@/types';

interface FontContextType {
  font: AppFont;
  setFont: (font: AppFont) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: ReactNode }) {
  const [font, setFont] = useState<AppFont>('proxima-nova');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedFont = localStorage.getItem('app-font');
    if (storedFont === 'inter' || storedFont === 'comic-sans' || storedFont === 'proxima-nova') {
      setFont(storedFont as AppFont);
    } else {
      setFont('proxima-nova');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const htmlElement = document.documentElement;
    let fontVariableValue = 'var(--font-proxima-nova)';
    let fontFamilyValue = 'var(--font-proxima-nova)';

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
  
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider');
  }
  
  const setFontWithRefresh = (newFont: AppFont) => {
    localStorage.setItem('app-font', newFont);
    
    context.setFont(newFont);
    
    window.location.reload();
  };
  
  return {
    font: context.font,
    setFont: setFontWithRefresh
  };
}
