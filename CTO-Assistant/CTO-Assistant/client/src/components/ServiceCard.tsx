import { Service } from "@shared/schema";
import { Link } from "wouter";
import * as Icons from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function ServiceCard({ service }: { service: Service }) {
  const { language } = useLanguage();
  
  // Dynamic icon component
  const IconComponent = (Icons as any)[service.icon] || Icons.HelpCircle;

  const getName = () => {
    if (language === 'ar') return service.nameAr;
    if (language === 'fr') return service.nameFr;
    return service.nameEn;
  };

  return (
    <Link href={`/providers?serviceId=${service.id}`}>
      <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 size-32 rounded-full bg-primary/5 transition-all group-hover:bg-primary/10" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
            <IconComponent className="size-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {getName()}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            Find the best {getName()} experts in your area ready to help.
          </p>
        </div>
      </div>
    </Link>
  );
}
