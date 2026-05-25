// src/hooks/useTranslate.js
import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import { translateText } from './translationService';

export const useTranslate = (textKey) => {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(textKey);
  const [isLoading, setIsLoading] = useState(false);

  const performTranslation = useCallback(async () => {
    if (!textKey || language === 'en') {
      setTranslatedText(textKey);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const result = await translateText(textKey, language);
    setTranslatedText(result);
    setIsLoading(false);
  }, [textKey, language]);

  useEffect(() => {
    performTranslation();
  }, [performTranslation]);

  return { translatedText, isLoading };
};