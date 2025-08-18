
"use client";

import { useState } from 'react';
import Image from 'next/image';
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import HomeLayout from '../home/layout';
import { Loader2 } from 'lucide-react';

const donationSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères." }),
  description: z.string().min(10, { message: "La description doit contenir au moins 10 caractères." }),
  contact: z.string().min(3, { message: "Veuillez fournir une information de contact." }),
  image: z.any()
    .refine((files) => files?.length == 1, "Une image est requise.")
    .refine((files) => files?.[0]?.size <= 5000000, `La taille maximale de l'image est 5MB.`)
    .refine(
      (files) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(files?.[0]?.type),
      "Formats de fichier acceptés: .jpg, .jpeg, .png, .webp"
    ),
});

type DonationFormValues = z.infer<typeof donationSchema>;

function NewDonationPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      title: '',
      description: '',
      contact: '',
    }
  });
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "donations_preset");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dxhi9cmbi/image/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Échec du téléversement de l'image");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Erreur Cloudinary:", error);
      return null;
    }
  };


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
      const imageFile = data.image[0];
      const imageUrl = await uploadImageToCloudinary(imageFile);

      if (!imageUrl) {
        toast({
          title: "Erreur de téléversement",
          description: "Impossible de téléverser l'image. Veuillez réessayer.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      const imageHint = data.title.split(' ').slice(0, 2).join(' ');

      const newDonation = {
        title: data.title,
        description: data.description,
        contact: data.contact,
        imageUrl: imageUrl,
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
        description: "Une erreur est survenue lors de la publication de votre don.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const imageRef = form.register('image');

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
                  name="image"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Photo de l'objet</FormLabel>
                      <FormControl>
                      <Input 
                          type="file" 
                          accept="image/*"
                          {...imageRef}
                          onChange={(e) => {
                            field.onChange(e.target.files);
                            handleImageChange(e);
                          }}
                      />
                      </FormControl>
                      <FormDescription>
                        Une belle image aide votre objet à trouver preneur plus vite.
                      </FormDescription>
                      <FormMessage />
                  </FormItem>
                  )}
              />
               {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Aperçu de l'image :</p>
                  <Image src={imagePreview} alt="Aperçu" width={200} height={200} className="rounded-md object-cover" />
                </div>
              )}
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publication en cours...
                  </>
                ) : 'Publier le don'}
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

    