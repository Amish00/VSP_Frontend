const MY_MEMORY_API_URL = 'https://api.mymemory.translated.net/get';
const MY_MEMORY_EMAIL = import.meta.env?.VITE_MY_MEMORY_EMAIL;

const translationCache = new Map();

export const translateText = async (text, targetLang, sourceLang = 'en') => {
  if (!text || !targetLang || targetLang === 'en') return text;

  const cacheKey = `${text}|${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const encodedText = encodeURIComponent(text);
  let url = `${MY_MEMORY_API_URL}?q=${encodedText}&langpair=${sourceLang}|${targetLang}`;
  if (MY_MEMORY_EMAIL) url += `&de=${encodeURIComponent(MY_MEMORY_EMAIL)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    let translated = data?.responseData?.translatedText || data?.matches?.[0]?.translation;
    if (translated && translated.includes('[source:')) {
      translated = translated.split('[')[0].trim();
    }
    const result = translated || text;
    translationCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Translation API error:', error);
    return text;
  }
};