
"use client"
import React, { useMemo } from 'react';
import { DonationCard } from '@/components/donation-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import { useDonations } from '@/hooks/use-donations';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, PhoneOutgoing } from 'lucide-react';

export default function HomePage() {
  const { donations, loading } = useDonations();

  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 10000, stopOnInteraction: true })
  )
  
  const donationsAutoplayPlugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  const shuffledDonations = useMemo(() => {
    return [...donations].sort(() => Math.random() - 0.5);
  }, [donations]);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Section Nouveautés Animée */}
      <section className="mb-12">
        <Carousel
          plugins={[autoplayPlugin.current]}
          className="w-full"
          onMouseEnter={autoplayPlugin.current.stop}
          onMouseLeave={autoplayPlugin.current.reset}
          opts={{
              align: "start",
              loop: true,
          }}
        >
          <CarouselContent>
            {/* Bannière 1: Dons Gratuits */}
            <CarouselItem>
              <Card className="bg-primary/10 border-primary/30 overflow-hidden">
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                  <div className="bg-primary text-primary-foreground rounded-full p-4">
                    <Gift className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-foreground/90">Les dons sont 100% gratuits !</h3>
                    <p className="text-primary-foreground/80 mt-1">Publiez autant de dons que vous le souhaitez, sans aucune limite et sans jamais payer.</p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
            
            {/* Bannière 2: Limites de Contact */}
            <CarouselItem>
              <Card className="bg-accent/10 border-accent/30 overflow-hidden">
                 <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                  <div className="bg-accent text-accent-foreground rounded-full p-4">
                    <PhoneOutgoing className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-accent-foreground">3 contacts offerts pour commencer !</h3>
                    <p className="text-accent-foreground/90 mt-1">
                      Après vos 3 contacts gratuits, passez au Premium pour seulement 1500 FCFA/mois et contactez en illimité.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="ml-12 hidden sm:flex" />
          <CarouselNext className="mr-12 hidden sm:flex" />
        </Carousel>
      </section>

      {/* Section des dons récents */}
      <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Dons récents</h2>
          
          {loading ? (
             <div className="flex space-x-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3 w-1/3">
                    <Skeleton className="h-[224px] w-full rounded-xl" />
                    <div className="space-y-2 p-4">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                    </div>
                ))}
             </div>
          ) : donations.length === 0 ? (
             <Alert>
                <AlertTitle>Aucun don pour le moment</AlertTitle>
                <AlertDescription>
                    Soyez le premier à publier un don !
                </AlertDescription>
            </Alert>
          ) : (
            <Carousel
                plugins={[donationsAutoplayPlugin.current]}
                className="w-full"
                onMouseEnter={donationsAutoplayPlugin.current.stop}
                onMouseLeave={donationsAutoplayPlugin.current.reset}
                opts={{
                    align: "start",
                    loop: true,
                }}
            >
                <CarouselContent>
                    {donations.map((donation) => (
                    <CarouselItem key={donation.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                        <DonationCard donation={donation} />
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="ml-12" />
                <CarouselNext className="mr-12" />
            </Carousel>
          )}
      </section>

      {/* Section Fil d'actualité */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Fil d'actualité</h2>
        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[224px] w-full rounded-xl" />
                    <div className="space-y-2 p-4">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                    </div>
                ))}
             </div>
        ) : donations.length === 0 ? (
            <Alert>
                <AlertTitle>Le fil d'actualité est vide</AlertTitle>
                <AlertDescription>
                    Aucun don n'a encore été publié.
                </AlertDescription>
            </Alert>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shuffledDonations.map((donation) => (
                    <DonationCard key={donation.id} donation={donation} />
                ))}
            </div>
        )}
      </section>
    </div>
  );
}
