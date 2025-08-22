
"use client"
import React from 'react';
import { DonationCard } from '@/components/donation-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import { useDonations } from '@/hooks/use-donations';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function HomePage() {
  const { donations, loading } = useDonations();

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
                plugins={[plugin.current]}
                className="w-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
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
    </div>
  );
}
