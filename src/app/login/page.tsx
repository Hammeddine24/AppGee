
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { createUser, loginWithConnectionCode } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";

function LoginPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  // Sign In State
  const [connectionCode, setConnectionCode] = useState('');

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSigningUp = useRef(false);

  // If user is already logged in, redirect to home page, unless they are signing up
  useEffect(() => {
    if (!loading && user && !isSigningUp.current) {
      router.push('/home');
    }
  }, [user, loading, router]);


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await loginWithConnectionCode(connectionCode);
      if (user) {
        toast({ title: "Succès", description: "Connexion réussie." });
        router.push('/home');
      } else {
        throw new Error("Code de connexion invalide.");
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
    isSigningUp.current = true;
    try {
      const { connectionCode: generatedCode } = await createUser(signUpName, signUpEmail);
      if(generatedCode) {
        // Redirect to the page that shows the code
        router.push(`/show-code?code=${generatedCode}`);
      } else {
         throw new Error("La création de l'utilisateur a échoué.");
      }
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
       isSigningUp.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render a loading state or nothing while checking auth status
  if (loading || (user && !isSigningUp.current)) {
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
                  Entrez votre code de connexion unique pour accéder à votre compte.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="code">Code de connexion</Label>
                      <Input id="code" type="text" placeholder="Ex: KL68VZ" required value={connectionCode} onChange={(e) => setConnectionCode(e.target.value)} />
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
