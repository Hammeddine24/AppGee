"use client"
import React from 'react';
import { DonationCard } from '@/components/donation-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { donations } from '@/lib/mock-data';
import Autoplay from "embla-carousel-autoplay"

export default function HomePage() {
  const recentDonations = donations.slice(0, 5);
  const weeklyDonations = donations.slice(5, 10);
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Section Dons Récents */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Dons Récents</h2>
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
            {recentDonations.map((donation) => (
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
      </section>

      {/* Section Dons de la Semaine */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Dons de la Semaine</h2>
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
            {weeklyDonations.map((donation) => (
              <CarouselItem key={donation.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <DonationCard donation={donation} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="ml-12"/>
          <CarouselNext className="mr-12"/>
        </Carousel>
      </section>

      {/* Fil d'actualité */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Fil d'actualité</h2>
        <div className="flex flex-col gap-6">
          {donations.map((donation) => (
            <DonationCard key={donation.id} donation={donation} />
          ))}
        </div>
      </section>
    </div>
  );
}
