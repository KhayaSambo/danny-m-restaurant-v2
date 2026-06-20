import React, { useEffect } from 'react';
import { Hero } from '../components/Hero';
import { PromotionsSection } from '../components/PromotionsSection';
import { SignatureSpecials } from '../components/SignatureSpecials';

export const Home: React.FC = () => {
  useEffect(() => {
    document.title = "Danny M | Authentic African Flavors in Pretoria Central";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', "Enjoy traditional slow-cooked stews, slow-braised Mogodu, and perfect Braai at Danny M Restaurant, located in the heart of Pretoria Central.");
  }, []);

  return (
    <div className="animate-fade-in">
      <Hero />
      <PromotionsSection />
      <SignatureSpecials />
    </div>
  );
};
