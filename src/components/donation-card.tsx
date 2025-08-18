import Image from 'next/image';
import type { Donation } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface DonationCardProps {
  donation: Donation;
}

export function DonationCard({ donation }: DonationCardProps) {
  return (
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
        <Badge variant="secondary" className="mb-2">{donation.category}</Badge>
        <h3 className="text-lg font-bold">{donation.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{donation.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{donation.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{donation.user.name}</span>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Contacter</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Contacter {donation.user.name}</AlertDialogTitle>
              <AlertDialogDescription>
                Utilisez les informations ci-dessous pour contacter le donateur.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4 p-4 bg-muted rounded-md text-center">
                <p className="text-lg font-semibold">{donation.contact}</p>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction>Fermer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
