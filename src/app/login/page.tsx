
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { createUser, loginWithConnectionCode } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";

function LoginPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [connectionCode, setConnectionCode] = useState('');

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  
  // Dialog State
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to home page
    if (!loading && user) {
      router.push('/home');
    }
  }, [user, loading, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await loginWithConnectionCode(signInEmail, connectionCode);
      if (user) {
        toast({ title: "Succès", description: "Connexion réussie." });
        router.push('/home');
      }
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { user, connectionCode } = await createUser(signUpName, signUpEmail);
      if(user && connectionCode) {
        setGeneratedCode(connectionCode);
        setShowCodeDialog(true);
        // Firebase signs the user in automatically after creation.
        // We will show them their code, and the dialog's button will handle the redirect.
      } else {
         throw new Error("La création de l'utilisateur a échoué.");
      }
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const closeDialogAndRedirect = () => {
    setShowCodeDialog(false);
    router.push('/home');
  }

  // Render a loading state or nothing while checking auth status
  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Leaf className="h-10 w-10 text-primary" />
        </div>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Se connecter</TabsTrigger>
            <TabsTrigger value="signup">S'inscrire</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Bienvenue !</CardTitle>
                <CardDescription>
                  Connectez-vous avec votre e-mail et votre code de connexion.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="m@example.com" required value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="code">Code de connexion</Label>
                      <Input id="code" type="text" required value={connectionCode} onChange={(e) => setConnectionCode(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Connexion...' : 'Se connecter'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
             <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Créez votre compte</CardTitle>
                <CardDescription>
                  Rejoignez la communauté et commencez à donner.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp}>
                  <div className="grid gap-4">
                     <div className="grid gap-2">
                      <Label htmlFor="name">Nom</Label>
                      <Input id="name" placeholder="Prénom Nom" required value={signUpName} onChange={(e) => setSignUpName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email-signup">Email</Label>
                      <Input id="email-signup" type="email" placeholder="m@example.com" required value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Création...' : 'S\'inscrire'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <AlertDialog open={showCodeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Votre compte est créé !</AlertDialogTitle>
            <AlertDialogDescription>
              Voici votre code de connexion unique. Conservez-le précieusement, il vous sera demandé pour vous connecter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 p-4 bg-muted rounded-md text-center">
            <p className="text-2xl font-bold tracking-widest">{generatedCode}</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={closeDialogAndRedirect}>J'ai compris</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { AuthProvider } from "@/hooks/use-auth";

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginPageContent />
    </AuthProvider>
  );
}
