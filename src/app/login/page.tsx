"use client";

import { useState } from "react";
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
import { createUser, loginWithCode } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInCode, setSignInCode] = useState('');

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  
  // Dialog State
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await loginWithCode(signInEmail, signInCode);
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
      const { user, connectionCode } = await createUser(signUpName, signUpEmail, signUpPassword);
      setGeneratedCode(connectionCode);
      setShowCodeDialog(true);
       // After sign up, we also log them in by setting the session storage
      sessionStorage.setItem('user', JSON.stringify(user));
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
                      <Label htmlFor="connection-code">Code de connexion</Label>
                      <Input id="connection-code" type="text" required maxLength={6} value={signInCode} onChange={(e) => setSignInCode(e.target.value)} />
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
                    <div className="grid gap-2">
                      <Label htmlFor="password-signup">Mot de passe</Label>
                      <Input id="password-signup" type="password" required value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} />
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
