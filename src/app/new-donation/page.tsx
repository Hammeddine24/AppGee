"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDonation } from '@/lib/donations';
import { useAuth } from '@/hooks/use-auth';
import { triggerDonationsUpdate } from '@/hooks/use-donations';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import HomeLayout from '../home/layout';

const donationSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères." }),
  description: z.string().min(10, { message: "La description doit contenir au moins 10 caractères." }),
  contact: z.string().min(3, { message: "Veuillez fournir une information de contact." }),
});

type DonationFormValues = z.infer<typeof donationSchema>;

function NewDonationPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      title: '',
      description: '',
      contact: '',
    }
  });

  async function onSubmit(data: DonationFormValues) {
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour publier un don.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Utiliser une image de remplacement
      const placeholderImageUrl = "https://placehold.co/600x400.png";
      const imageHint = data.title.split(' ').slice(0, 2).join(' ');

      const newDonation = {
        title: data.title,
        description: data.description,
        contact: data.contact,
        imageUrl: placeholderImageUrl,
        imageHint: imageHint.toLowerCase(),
      };

      await addDonation(newDonation);
      
      triggerDonationsUpdate();

      toast({
        title: "Succès!",
        description: "Votre don a été publié avec succès.",
      });

      router.push('/home');
    } catch (error) {
      console.error("Error adding donation: ", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication de votre don. Vérifiez les permissions de votre base de données.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Publier un nouveau don</CardTitle>
          <CardDescription>
            Remplissez les informations ci-dessous pour donner une nouvelle vie à votre objet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Fauteuil vintage en cuir" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez l'état de votre objet, ses dimensions, etc."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Information de contact</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: monemail@exemple.com ou 0612345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {!user && (
                  <Alert variant="destructive">
                    <AlertTitle>Attention</AlertTitle>
                    <AlertDescription>
                      Vous devez être connecté pour publier un don.
                    </AlertDescription>
                  </Alert>
                )}
              <Button type="submit" className="w-full" disabled={isSubmitting || !user}>
                {isSubmitting ? 'Publication en cours...' : 'Publier le don'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewDonationPage() {
    return (
        <HomeLayout>
            <NewDonationPageContent />
        </HomeLayout>
    )
}
