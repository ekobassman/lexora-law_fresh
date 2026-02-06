import { useLanguageContext } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function Pricing() {
  const { t } = useLanguageContext();

  return (
    <main className="container pt-24 pb-16 px-4 bg-[#0f172a] min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">{t('nav.pricing')}</h1>
        <p className="text-muted-foreground">Choose the plan that fits your needs</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Free</h3>
            <p className="text-2xl font-bold">€0</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">1 case, basic features</p>
            <Button variant="outline" className="w-full">Get started</Button>
          </CardContent>
        </Card>
        <Card className="border-gold">
          <CardHeader>
            <h3 className="font-semibold">Starter</h3>
            <p className="text-2xl font-bold">€3.99/mo</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">10 cases, 15 messages/day</p>
            <Button className="w-full">Subscribe</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Pro</h3>
            <p className="text-2xl font-bold">€9.99/mo</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">50 cases, 50 messages/day</p>
            <Button variant="outline" className="w-full">Subscribe</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
