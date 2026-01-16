import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface TestimonialProps {
  quote: string;
  author: string;
  organization: string;
}

const TestimonialCard = ({ quote, author, organization }: TestimonialProps) => {
  const initials = author.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Card className="bg-white border border-border/50 shadow-lg h-full">
      <CardContent className="p-6 md:p-8 flex flex-col h-full">
        <Quote className="w-10 h-10 text-[#d97706]/20 mb-4 flex-shrink-0" />
        
        <blockquote className="text-base md:text-lg text-foreground mb-6 italic leading-relaxed flex-1">
          "{quote}"
        </blockquote>

        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-[#d97706]">
            <AvatarFallback className="bg-gradient-to-br from-[#1e3a8a] to-[#d97706] text-white font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-foreground">{author}</p>
            <p className="text-sm text-muted-foreground">{organization}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const TestimonialsCulture = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      quote: t('siloCulture.testimonials.items.0.quote'),
      author: t('siloCulture.testimonials.items.0.author'),
      organization: t('siloCulture.testimonials.items.0.organization'),
    },
    {
      quote: t('siloCulture.testimonials.items.1.quote'),
      author: t('siloCulture.testimonials.items.1.author'),
      organization: t('siloCulture.testimonials.items.1.organization'),
    },
    {
      quote: t('siloCulture.testimonials.items.2.quote'),
      author: t('siloCulture.testimonials.items.2.author'),
      organization: t('siloCulture.testimonials.items.2.organization'),
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          {t('siloCulture.testimonials.title')}
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          {t('siloCulture.testimonials.subtitle')}
        </p>

        <div className="max-w-5xl mx-auto">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <TestimonialCard {...testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white" />
            <CarouselNext className="hidden md:flex -right-12 border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};
