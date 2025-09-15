
"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Loader2 } from "lucide-react";

function ShowCodeContent() {
    const router = useRouter();
    const { toast } = useToast();
    const [code, setCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Retrieve the code from sessionStorage
        const storedCode = sessionStorage.getItem('connectionCode');
        if (storedCode) {
            setCode(storedCode);
            // Clean up the sessionStorage immediately after reading
            sessionStorage.removeItem('connectionCode');
        }
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!code) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4 text-center">
                <p>Code de connexion non trouvé. Veuillez vous réinscrire.</p>
            </div>
        );
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        toast({
            title: "Copié !",
            description: "Votre code de connexion a été copié dans le presse-papiers.",
        });
    };

    const handleContinue = () => {
        router.push('/select-currency');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Votre compte est créé !</CardTitle>
                    <CardDescription>
                        Voici votre code de connexion unique. Conservez-le précieusement, il est le seul moyen d'accéder à votre compte.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="my-4 p-4 bg-muted rounded-md flex items-center justify-center gap-4">
                        <p className="text-3xl font-bold tracking-widest">{code}</p>
                        <Button variant="ghost" size="icon" onClick={handleCopy}>
                            <Copy className="h-6 w-6" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Ce code remplace un mot de passe. Ne le partagez pas.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleContinue}>Continuer</Button>
                </CardFooter>
            </Card>
        </div>
    );
}


export default function ShowCodePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ShowCodeContent />
        </Suspense>
    )
}
