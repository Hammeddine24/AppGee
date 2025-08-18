"use client"
import React, { useEffect, useState } from 'react';
import { DonationCard } from '@/components/donation-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import { getDonations } from '@/lib/donations';
import type { Donation } from '@/lib/types';

export default function HomePage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  
  useEffect(() => {
    async function fetchDonations() {
      const donationsFromDb = await getDonations();
      setDonations(donationsFromDb);
    }
    fetchDonations();
  }, []);

  const featuredDonations = donations.slice(0, 10);
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Section À la une */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">À la une</h2>
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
            {featuredDonations.map((donation) => (
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
