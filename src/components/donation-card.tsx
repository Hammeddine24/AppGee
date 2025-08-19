
"use client"
import Image from 'next/image';
import type { Donation } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { incrementContactCount } from '@/lib/donations';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from 'react';
import { Zap } from 'lucide-react';


interface DonationCardProps {
  donation: Donation;
}

const FREE_CONTACT_LIMIT = 3;

function isPhoneNumber(contact: string) {
  // Simple check for digits, possibly with spaces or a + at the start
  return /^\+?\d[\d\s]+$/.test(contact);
}

function isEmail(contact: string) {
  return contact.includes('@');
}


export function DonationCard({ donation }: DonationCardProps) {
  const { user, userData, refreshUserData, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const initiateContact = () => {
    if (isPhoneNumber(donation.contact)) {
      window.location.href = `tel:${donation.contact.replace(/\s/g, '')}`;
    } else if (isEmail(donation.contact)) {
      window.location.href = `mailto:${donation.contact}`;
    } else {
      // Fallback for other contact types, maybe just copy to clipboard
      navigator.clipboard.writeText(donation.contact);
      toast({
        title: "Contact copié",
        description: "L'information de contact a été copiée dans le presse-papiers.",
      });
    }
  };
  
  const handleContact = async () => {
    if (!isLoggedIn || !user || !userData) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour contacter un donateur.",
        variant: "destructive",
      });
      return;
    }

    const currentPlan = userData.plan || 'free';
    const contactCount = userData.contactCount || 0;
    
    // Allow contact if user is on a paid plan
    if (currentPlan !== 'free') {
        initiateContact();
        return;
    }
    
    // Check if the free limit is reached
    if (contactCount >= FREE_CONTACT_LIMIT) {
        setShowUpgradeDialog(true);
        return;
    }

    // If limit is not reached, increment count and show contact
    try {
        await incrementContactCount(user.uid);
        refreshUserData(); // Refresh user data to reflect new count
        initiateContact();
    } catch (error) {
        console.error("Failed to increment contact count:", error);
        toast({
            title: "Erreur",
            description: "Impossible de mettre à jour votre nombre de contacts.",
            variant: "destructive"
        })
    }
  }

  const handleGoToPlan = () => {
    setShowUpgradeDialog(false);
    router.push('/plan');
  }

  return (
    <>
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative h-56 w-full">
          <Image
            src={donation.imageUrl}
            alt={donation.title}
            fill
            className="object-cover"
            data-ai-hint={donation.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <h3 className="text-lg font-bold">{donation.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{donation.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{donation.user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{donation.user.name}</span>
        </div>
         <Button variant="outline" onClick={handleContact}>Contacter</Button>
      </CardFooter>
    </Card>

    {/* Upgrade Dialog */}
    <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-6 w-6 text-primary" />
                    <AlertDialogTitle>Limite de contacts atteinte</AlertDialogTitle>
                </div>
                <AlertDialogDescription>
                    Vous avez utilisé tous vos contacts gratuits. Pour continuer à contacter des donateurs, veuillez passer au plan Premium.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Plus tard</AlertDialogCancel>
                <AlertDialogAction onClick={handleGoToPlan}>
                    Voir mon plan
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
   </>
  );
}
