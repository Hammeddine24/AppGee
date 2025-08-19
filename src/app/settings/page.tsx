
"use client"
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { updateUserName, deleteUserAccount } from '@/lib/user';
import { useRouter } from 'next/navigation';
import HomeLayout from '../home/layout';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(3, { message: "Le nom doit contenir au moins 3 caractères." }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function SettingsPageContent() {
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        values: {
            name: user?.displayName || '',
        },
    });

    const handleProfileUpdate = async (data: ProfileFormValues) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await updateUserName(user.uid, data.name);
            toast({
                title: "Succès",
                description: "Votre nom a été mis à jour.",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour votre nom.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteAccount = async () => {
        if (!user) return;
        setIsDeleting(true);
        try {
            await deleteUserAccount(user.uid);
            toast({
                title: "Compte supprimé",
                description: "Votre compte et toutes vos données ont été supprimés.",
            });
            router.push('/login'); // Redirect to login page after deletion
        } catch (error: any) {
            toast({
                title: "Erreur de suppression",
                description: error.message || "Une erreur est survenue.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    }

    if (loading) {
        return <div className="container mx-auto py-8"><p>Chargement...</p></div>
    }
    
    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
             <div className="max-w-2xl mx-auto space-y-8">
                {/* Profile Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profil</CardTitle>
                        <CardDescription>Gérez les informations publiques de votre profil.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom d'utilisateur</Label>
                                <Input id="name" {...form.register('name')} />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                                )}
                            </div>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Choisissez comment vous souhaitez être notifié.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="email-notifications" className="font-medium">Notifications par e-mail</Label>
                                <p className="text-sm text-muted-foreground">Recevoir des e-mails sur l'activité de votre compte.</p>
                            </div>
                            <Switch id="email-notifications" disabled />
                       </div>
                       <Separator />
                       <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="push-notifications" className="font-medium">Notifications push</Label>
                                <p className="text-sm text-muted-foreground">Recevoir des notifications push sur vos appareils.</p>
                            </div>
                            <Switch id="push-notifications" disabled />
                       </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Zone de danger</CardTitle>
                        <CardDescription>Cette action est irréversible. Soyez prudent.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isDeleting}>Supprimer mon compte</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est irréversible. Toutes vos données, y compris vos dons, seront définitivement supprimées.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Oui, supprimer mon compte
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
             </div>
        </div>
    )
}

export default function SettingsPage() {
    return (
        <HomeLayout>
            <SettingsPageContent />
        </HomeLayout>
    )
}
