
"use client"
import Image from 'next/image';
import type { Donation, DonationStatus } from '@/lib/types';
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
import { cn } from '@/lib/utils';


interface DonationCardProps {
  donation: Donation;
  showStatusEditor?: boolean;
  onStatusChange?: (donationId: string, newStatus: DonationStatus) => void;
}

const FREE_CONTACT_LIMIT = 3;

function isPhoneNumber(contact: string) {
  return /^\+?\d[\d\s]+$/.test(contact);
}

function isEmail(contact: string) {
  return contact.includes('@');
}


export function DonationCard({ donation, showStatusEditor = false, onStatusChange }: DonationCardProps) {
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
    
    if (currentPlan !== 'free') {
        initiateContact();
        return;
    }
    
    if (contactCount >= FREE_CONTACT_LIMIT) {
        setShowUpgradeDialog(true);
        return;
    }

    try {
        await incrementContactCount(user.uid);
        refreshUserData();
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

  const getStatusBadgeVariant = (status: DonationStatus) => {
    switch (status) {
        case 'disponible':
            return 'default';
        case 'en cours':
            return 'secondary';
        case 'pris':
            return 'destructive';
        default:
            return 'outline';
    }
  }

  const handleLocalStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as DonationStatus;
    if (onStatusChange) {
      onStatusChange(donation.id, newStatus);
    }
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
           <Badge 
            variant={getStatusBadgeVariant(donation.status)}
            className="absolute top-2 right-2 capitalize"
          >
            {donation.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <h3 className="text-lg font-bold">{donation.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{donation.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        {showStatusEditor ? (
          <div className="w-full">
            <label htmlFor={`status-${donation.id}`} className="text-xs font-medium text-muted-foreground">Changer le statut :</label>
            <select
                id={`status-${donation.id}`}
                value={donation.status}
                onChange={handleLocalStatusChange}
                className="w-full mt-1 p-2 border rounded-md bg-background text-sm"
            >
                <option value="disponible">Disponible</option>
                <option value="en cours">En cours</option>
                <option value="pris">Pris</option>
            </select>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{donation.user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{donation.user.name}</span>
            </div>
            <Button variant="outline" onClick={handleContact} disabled={donation.status === 'pris'}>Contacter</Button>
          </>
        )}
      </CardFooter>
    </Card>

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
