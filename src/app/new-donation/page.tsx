"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDonation } from '@/lib/donations';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const donationSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères." }),
  description: z.string().min(10, { message: "La description doit contenir au moins 10 caractères." }),
  category: z.string({ required_error: "Veuillez sélectionner une catégorie." }),
  imageUrl: z.string().url({ message: "Veuillez entrer une URL d'image valide." }),
});

type DonationFormValues = z.infer<typeof donationSchema>;

export default function NewDonationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
    }
  });

  async function onSubmit(data: DonationFormValues) {
    setIsSubmitting(true);
    try {
      // Hardcoded user for now, as there is no auth
      const user = {
        name: 'Utilisateur Anonyme',
        avatarUrl: 'https://i.pravatar.cc/40?u=anonymous',
      };
      
      const newDonation = {
        ...data,
        imageHint: data.category.toLowerCase(), // simple hint from category
      };

      await addDonation(newDonation, user);

      toast({
        title: "Succès!",
        description: "Votre don a été publié avec succès.",
      });

      router.push('/home');
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication de votre don.",
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mobilier">Mobilier</SelectItem>
                        <SelectItem value="Musique">Musique</SelectItem>
                        <SelectItem value="Sport">Sport</SelectItem>
                        <SelectItem value="Décoration">Décoration</SelectItem>
                        <SelectItem value="Jardinage">Jardinage</SelectItem>
                        <SelectItem value="Cuisine">Cuisine</SelectItem>
                         <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de l'image</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://exemple.com/image.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Publication en cours...' : 'Publier le don'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
