
"use client"
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Donation, DonationStatus } from '@/lib/types';
import { DonationCard } from '@/components/donation-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import HomeLayout from '../home/layout';
import { useDonations, triggerDonationsUpdate } from '@/hooks/use-donations';
import { updateDonationStatus } from '@/lib/donations';
import { useToast } from '@/hooks/use-toast';

function MyDonationsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { donations, loading: donationsLoading } = useDonations();
  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (user && donations.length > 0) {
      const filtered = donations.filter(d => d.user.id === user.uid);
      setUserDonations(filtered);
    } else {
      setUserDonations([]);
    }
  }, [user, donations]);

  const handleStatusChange = async (donationId: string, newStatus: DonationStatus) => {
    try {
      // Optimistically update the UI
      setUserDonations(prevDonations => 
        prevDonations.map(d => 
          d.id === donationId ? { ...d, status: newStatus } : d
        )
      );

      await updateDonationStatus(donationId, newStatus);
      
      // Trigger a global refresh to ensure data consistency across the app
      triggerDonationsUpdate();

      toast({
        title: "Statut mis à jour",
        description: "Le statut de votre don a été modifié.",
      });

    } catch (error) {
       toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du don.",
        variant: "destructive",
      });
      // Revert UI on failure
      triggerDonationsUpdate();
    }
  };

  const isLoading = authLoading || donationsLoading;

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
      ) : userDonations.length === 0 ? (
        <Alert>
          <AlertTitle>Aucun don trouvé</AlertTitle>
          <AlertDescription>
            Vous n'avez pas encore publié de don. Commencez dès maintenant !
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userDonations.map((donation) => (
            <DonationCard 
              key={donation.id} 
              donation={donation} 
              showStatusEditor={true}
              onStatusChange={handleStatusChange}
            />
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
