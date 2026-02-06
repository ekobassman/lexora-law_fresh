import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Check, Sparkles, Zap, Building2, Crown } from 'lucide-react';
import { useLanguageContext } from '@/contexts/LanguageContext';

function getSafeText(t: (key: string) => string, key: string, fallback: string): string {
  const result = t(key);
  if (!result || result === key || (result.includes('.') && !result.includes(' '))) return fallback;
  return result;
}

interface PricingSectionProps {
  id?: string;
}

export function PricingSection({ id }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false);
  const { t } = useLanguageContext();

  const plans = [
    { key: 'free', monthlyPrice: 0, yearlyPrice: 0, icon: Zap, popular: false },
    { key: 'starter', monthlyPrice: 3.99, yearlyPrice: 39.9, icon: Sparkles, popular: false },
    { key: 'pro', monthlyPrice: 9.99, yearlyPrice: 99.9, icon: Building2, popular: true },
    { key: 'unlimited', monthlyPrice: 19.99, yearlyPrice: 199.9, icon: Crown, popular: false },
  ].map((p) => ({
    ...p,
    name: getSafeText(t, `landingSections.pricing.plans.${p.key}.name`, p.key),
    description: getSafeText(t, `landingSections.pricing.plans.${p.key}.description`, ''),
    cta: getSafeText(t, `landingSections.pricing.plans.${p.key}.cta`, 'Choose'),
    ctaLink: p.key === 'free' ? '/auth?mode=signup' : `/auth?mode=signup&plan=${p.key}`,
    features: [0, 1, 2, 3, 4].map((i) => getSafeText(t, `landingSections.pricing.plans.${p.key}.features.${i}`, '')).filter(Boolean),
  }));

  return (
    <section id={id} className="py-20 bg-[#f5f5f0]">
      <div className="container">
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-transparent text-[#d4af37] border border-[#d4af37] mb-4">
            {getSafeText(t, 'landingSections.pricing.badge', 'Pricing')}
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-[#0f172a] mb-4">
            {getSafeText(t, 'landingSections.pricing.title', 'Transparent pricing, no hidden costs')}
          </h2>
          <p className="text-[#4b5563] max-w-2xl mx-auto mb-8">
            {getSafeText(t, 'landingSections.pricing.subtitle', 'Choose the plan that fits your needs.')}
          </p>

          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!isYearly ? 'text-navy font-semibold' : 'text-navy/60'}`}>
              {getSafeText(t, 'landingSections.pricing.monthly', 'Monthly')}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isYearly}
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${isYearly ? 'bg-gold' : 'bg-navy/20'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${isYearly ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm ${isYearly ? 'text-navy font-semibold' : 'text-navy/60'}`}>
              {getSafeText(t, 'landingSections.pricing.yearly', 'Yearly')}
            </span>
            {isYearly && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                {getSafeText(t, 'landingSections.pricing.save', '2 months free')}
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const period = isYearly ? getSafeText(t, 'landingSections.pricing.perYear', '/year') : getSafeText(t, 'landingSections.pricing.perMonth', '/month');
            return (
              <Card
                key={plan.key}
                className={`relative flex flex-col overflow-hidden min-h-0 rounded-2xl ${
                  plan.popular ? 'border-2 border-[#d4af37] shadow-lg scale-105' : 'border border-[#e5e7eb]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-[#d4af37] text-black">
                      {getSafeText(t, 'landingSections.pricing.popular', 'Popular')}
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center shrink-0 ${plan.popular ? 'bg-[#d4af37]/20' : 'bg-[#e5e7eb]'}`}>
                    <Icon className={`h-6 w-6 shrink-0 ${plan.popular ? 'text-[#d4af37]' : 'text-[#4b5563]'}`} />
                  </div>
                  <CardTitle className="text-xl text-[#0f172a] line-clamp-2 break-words">{plan.name}</CardTitle>
                  <p className="text-sm text-[#4b5563] line-clamp-2 break-words mt-1">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-1 min-h-0">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-[#0f172a]">
                      {price === 0 ? getSafeText(t, 'landingSections.pricing.free', 'Free') : `€${price.toFixed(2).replace('.', ',')}`}
                    </span>
                    {price > 0 && <span className="text-[#4b5563] text-sm">{period}</span>}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-navy/80 break-words">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="min-w-0">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Link
                    to={plan.ctaLink}
                    className={`inline-flex items-center justify-center w-full h-11 px-6 rounded-lg font-medium transition-colors ${plan.popular ? 'bg-[#d4af37] text-black hover:bg-[#b8941d]' : 'border border-[#0f172a] text-[#0f172a] bg-transparent hover:bg-[#0f172a] hover:text-white'}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-sm text-[#4b5563] mt-8">
          {getSafeText(t, 'landingSections.pricing.trustNote', 'No credit card required for the free plan. Cancel anytime.')}
        </p>
      </div>
    </section>
  );
}
