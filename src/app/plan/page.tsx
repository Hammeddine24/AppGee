
"use client"
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import HomeLayout from '../home/layout';
import { WhatsAppIcon } from '@/components/ui/icons';

const FREE_DONATION_LIMIT = 3;
const FREE_CONTACT_LIMIT = 3;
const WHATSAPP_LINK = "https://wa.me/22650679369?text=Bonjour,%20je%20souhaite%20passer%20au%20plan%20payant%20sur%20Gee.";

function PlanPageContent() {
    const { user, userData, loading } = useAuth();
    
    const donationCount = userData?.donationCount || 0;
    const contactCount = userData?.contactCount || 0;
    const currentPlan = userData?.plan || 'free';
    
    // Pour le plan gratuit, le nombre de dons est illimité, donc la barre de progression n'est plus pertinente.
    // Nous la gardons pour les contacts.
    const contactProgress = (contactCount / FREE_CONTACT_LIMIT) * 100;

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-5 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-1/3 mb-2" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                         <div className="space-y-4">
                            <Skeleton className="h-6 w-1/3 mb-2" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (!user) {
        return (
             <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Alert>
                    <AlertTitle>Non connecté</AlertTitle>
                    <AlertDescription>
                        Veuillez vous connecter pour voir votre plan.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Mon Plan</CardTitle>
                    <CardDescription>
                        Consultez votre utilisation et gérez votre abonnement.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                     {currentPlan === 'free' ? (
                         <>
                            <Alert>
                                <AlertTitle>Dons illimités et gratuits !</AlertTitle>
                                <AlertDescription>
                                    Vous pouvez publier autant de dons que vous le souhaitez.
                                </AlertDescription>
                            </Alert>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Vos contacts effectués</h3>
                                <Progress value={contactProgress} className="w-full mb-1" />
                                <p className="text-sm text-muted-foreground">{contactCount} / {FREE_CONTACT_LIMIT} contacts gratuits utilisés</p>
                            </div>
                         </>
                    ) : (
                         <Alert variant="default" className="bg-green-50 border-green-200">
                            <AlertTitle className="text-green-800">Plan Premium</AlertTitle>
                            <AlertDescription className="text-green-700">
                                Vous bénéficiez d'un accès illimité aux dons et aux contacts. Merci pour votre soutien !
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                {currentPlan === 'free' && (
                <CardFooter className="flex-col items-start gap-4 border-t pt-6">
                    <h3 className="text-lg font-bold">Passez au Premium</h3>
                    <p className="text-muted-foreground">
                       Pour 1500 FCFA/mois, contactez des utilisateurs en illimité !
                    </p>
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                        <Link href={WHATSAPP_LINK} target="_blank">
                           <WhatsAppIcon className="mr-2 h-5 w-5" /> Contacter par WhatsApp pour souscrire
                        </Link>
                    </Button>
                </CardFooter>
                )}
            </Card>
        </div>
    )
}

export default function PlanPage() {
    return (
        <HomeLayout>
            <PlanPageContent />
        </HomeLayout>
    )
}
