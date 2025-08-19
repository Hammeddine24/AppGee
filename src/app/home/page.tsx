
"use client"
import React, { useState, useMemo } from 'react';
import { DonationCard } from '@/components/donation-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import { useDonations } from '@/hooks/use-donations';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function HomePage() {
  const { donations, loading } = useDonations();
  const [searchTerm, setSearchTerm] = useState('');
  
  const featuredDonations = donations.filter(d => d.isFeatured);
  
  const filteredDonations = useMemo(() => {
    if (!searchTerm) {
      return donations;
    }
    return donations.filter(donation => 
      donation.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [donations, searchTerm]);

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Section À la une */}
      {featuredDonations.length > 0 && (
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
      )}

      {/* Fil d'actualité */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Fil d'actualité</h2>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un don..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((donation) => (
            <DonationCard key={donation.id} donation={donation} />
          ))}
        </div>
      </section>
    </div>
  );
}
