import { useLanguage } from "@/hooks/use-language";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useServices } from "@/hooks/use-data";
import { ServiceCard } from "@/components/ServiceCard";
import * as Icons from "lucide-react";

export default function Landing() {
  const { t } = useLanguage();
  const { data: services } = useServices();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32 md:pt-24 md:pb-48">
        <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(#3b82f61a_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="container relative z-10 px-4 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-display font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl">
              {t("hero.title")}
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
              {t("hero.subtitle")}
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all" onClick={() => setLocation("/services")}>
                {t("hero.cta")}
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl border-2 hover:bg-secondary" onClick={() => setLocation("/providers")}>
                Browse Providers
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-24 bg-secondary/50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display sm:text-4xl">Popular Services</h2>
            <p className="mt-4 text-muted-foreground">Everything you need for your home and business</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services?.slice(0, 8).map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/services">
              <Button variant="link" className="text-primary text-lg">
                View All Services &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features/Trust Section */}
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="size-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <Icons.ShieldCheck className="size-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Verified Professionals</h3>
              <p className="text-muted-foreground">Every provider is vetted for quality and reliability.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="size-16 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-6">
                <Icons.Clock className="size-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Save Time</h3>
              <p className="text-muted-foreground">Book services in minutes, not days.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="size-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <Icons.HeartHandshake className="size-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Satisfaction Guaranteed</h3>
              <p className="text-muted-foreground">We ensure you are happy with the service provided.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
