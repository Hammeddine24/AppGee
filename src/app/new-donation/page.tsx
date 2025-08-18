"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDonation } from '@/lib/donations';
import { uploadImage } from '@/lib/storage';
import { useAuth } from '@/hooks/use-auth';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud } from 'lucide-react';
import HomeLayout from '../home/layout';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const donationSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères." }),
  description: z.string().min(10, { message: "La description doit contenir au moins 10 caractères." }),
  category: z.string({ required_error: "Veuillez sélectionner une catégorie." }),
  contact: z.string().min(3, { message: "Veuillez fournir une information de contact." }),
  image: z
    .any()
    .refine((files) => files?.length == 1, "Une image est requise.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `La taille maximale est de 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Formats acceptés: .jpg, .jpeg, .png et .webp."
    ),
});

type DonationFormValues = z.infer<typeof donationSchema>;

function NewDonationPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      title: '',
      description: '',
      contact: '',
      image: undefined,
    }
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
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
    setUploadProgress(0);

    try {
      const imageFile = data.image[0];
      const imageUrl = await uploadImage(
        imageFile,
        (progress) => setUploadProgress(progress)
      );

      const newDonation = {
        title: data.title,
        description: data.description,
        category: data.category,
        contact: data.contact,
        imageUrl: imageUrl,
        imageHint: data.category.toLowerCase(),
      };

      await addDonation(newDonation, {
        id: user.uid,
        name: user.displayName || 'Utilisateur Anonyme',
      });

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
      setUploadProgress(0);
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
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo de l'objet</FormLabel>
                    <FormControl>
                      <div className="w-full">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={(e) => {
                            field.onChange(e.target.files);
                            handleImageChange(e);
                          }}
                        />
                         <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <UploadCloud className="mr-2 h-4 w-4" />
                          {previewImage ? "Changer l'image" : "Sélectionner une image"}
                        </Button>
                      </div>
                    </FormControl>
                     {previewImage && (
                      <div className="mt-4 w-full aspect-video relative rounded-md overflow-hidden border">
                          <Image src={previewImage} alt="Aperçu de l'image" fill className="object-cover" />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
               {isSubmitting && (
                  <div className="space-y-2">
                    <Label>Téléversement en cours...</Label>
                    <Progress value={uploadProgress} />
                  </div>
                )}
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
