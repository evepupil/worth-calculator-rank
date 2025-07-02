"use client";

import React from 'react';
import { useLanguage } from './LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  // 直接设置为中文，不显示切换按钮
  React.useEffect(() => {
    setLanguage('zh');
  }, [setLanguage]);

  // 不返回任何UI元素，因为我们只支持中文
  return null;
}; 