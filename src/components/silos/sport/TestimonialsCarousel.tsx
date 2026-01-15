import { useTranslation } from 'react-i18next';
import { TestimonialCard } from './TestimonialCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export const TestimonialsCarousel = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      club: t('siloSport.testimonials.items.0.club'),
      quote: t('siloSport.testimonials.items.0.quote'),
      metric: t('siloSport.testimonials.items.0.metric'),
    },
    {
      club: t('siloSport.testimonials.items.1.club'),
      quote: t('siloSport.testimonials.items.1.quote'),
      metric: t('siloSport.testimonials.items.1.metric'),
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          {t('siloSport.testimonials.title')}
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          {t('siloSport.testimonials.subtitle')}
        </p>

        <div className="max-w-4xl mx-auto">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/1 lg:basis-1/1">
                  <TestimonialCard {...testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF] hover:text-white" />
            <CarouselNext className="hidden md:flex -right-12 border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF] hover:text-white" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};
