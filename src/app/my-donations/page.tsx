"use client"
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getDonationsByUser } from '@/lib/donations';
import type { Donation } from '@/lib/types';
import { DonationCard } from '@/components/donation-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import HomeLayout from '../home/layout';

function MyDonationsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDonations() {
      if (user) {
        try {
          const userDonations = await getDonationsByUser(user.uid);
          setDonations(userDonations);
        } catch (error) {
          console.error("Failed to fetch user donations:", error);
        } finally {
          setLoading(false);
        }
      } else if (!authLoading) {
        setLoading(false);
      }
    }
    fetchDonations();
  }, [user, authLoading]);

  const isLoading = authLoading || loading;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Mes dons</h1>
      
      {isLoading ? (
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
      ) : !user ? (
        <Alert>
          <AlertTitle>Non connecté</AlertTitle>
          <AlertDescription>
            Veuillez vous connecter pour voir vos dons.
          </AlertDescription>
        </Alert>
      ) : donations.length === 0 ? (
        <Alert>
          <AlertTitle>Aucun don trouvé</AlertTitle>
          <AlertDescription>
            Vous n'avez pas encore publié de don. Commencez dès maintenant !
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <DonationCard key={donation.id} donation={donation} />
          ))}
        </div>
      )}
    </div>
  );
}


export default function MyDonationsPage() {
    return (
        <HomeLayout>
            <MyDonationsPageContent />
        </HomeLayout>
    )
}
