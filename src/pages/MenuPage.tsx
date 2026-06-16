import React, { useEffect } from 'react';
import { MenuSection } from '../components/MenuSection';
import { useTranslation } from '../hooks/useTranslation';

export const MenuPage: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t('menu.title')} | Danny M Restaurant`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', "Explore the full authentic African menu at Danny M. Traditional slow-cooked stews, Mogodu, and freshly made soul food in Pretoria.");
  }, [t]);

  return (
    <div className="pt-20 bg-bg-dark animate-fade-in min-h-screen">
      <MenuSection />
    </div>
  );
};
