import { useTranslation } from 'react-i18next';
import { UserPlus, Search, Handshake } from 'lucide-react';

const steps = [
  { icon: UserPlus, number: 1, key: 'step1' },
  { icon: Search, number: 2, key: 'step2' },
  { icon: Handshake, number: 3, key: 'step3' },
];

export const HowItWorksSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          {t('siloCulture.howItWorks.title')}
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#1e3a8a] to-[#d97706]" />
              )}
              
              <div className="relative inline-flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#d97706] flex items-center justify-center mb-4 shadow-lg">
                  <step.icon className="w-9 h-9 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#d97706] text-white font-bold flex items-center justify-center text-sm shadow">
                  {step.number}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-foreground mb-2">
                {t(`siloCulture.howItWorks.steps.${step.key}.title`)}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t(`siloCulture.howItWorks.steps.${step.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
