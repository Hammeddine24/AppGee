
"use client"

import React, { useState, useMemo } from 'react';
import { useDonations } from '@/hooks/use-donations';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { DonationCard } from '@/components/donation-card';
import HomeLayout from '../home/layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function SearchPageContent() {
    const { donations, loading } = useDonations();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDonations = useMemo(() => {
        if (!searchTerm) {
          return []; // Ne rien afficher si la recherche est vide
        }
        return donations.filter(donation =>
          donation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donation.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [donations, searchTerm]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }
    
    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-6">Rechercher un don</h1>
            <div className="relative w-full max-w-xl mx-auto mb-8">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Que cherchez-vous ? (ex: canapé, livre...)"
                    className="pl-12 h-12 text-lg"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    autoFocus
                />
            </div>
            
            {loading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-[224px] w-full rounded-xl" />
                        <div className="space-y-2 p-4">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                        </div>
                    ))}
                </div>
            ) : searchTerm && filteredDonations.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">Aucun résultat trouvé pour "{searchTerm}"</p>
                </div>
            ) : searchTerm ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDonations.map((donation) => (
                        <DonationCard key={donation.id} donation={donation} />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">Commencez à taper pour rechercher des dons.</p>
                </div>
            )}
        </div>
    )
}

export default function SearchPage() {
    return (
        <HomeLayout>
            <SearchPageContent />
        </HomeLayout>
    )
}
