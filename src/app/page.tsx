
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Gift, Users, Zap, Recycle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="inline-block font-bold text-2xl">Gee</span>
          </div>
          <Button asChild>
            <Link href="/login">Commencer</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
              Donnez une seconde vie à vos objets.
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
              Gee est la plateforme où la générosité rencontre l'écologie. Publiez gratuitement les objets que vous n'utilisez plus et trouvez des trésors près de chez vous.
            </p>
            <Button size="lg" asChild>
              <Link href="/login">Rejoignez la communauté</Link>
            </Button>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Comment ça marche ?</h2>
              <p className="text-muted-foreground mt-2">C'est simple comme bonjour.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground rounded-full p-4 mb-4">
                  <Gift className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Publiez votre don</h3>
                <p className="text-muted-foreground">Prenez une photo, décrivez votre objet et publiez votre don en quelques clics. C'est 100% gratuit et illimité.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground rounded-full p-4 mb-4">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Soyez contacté</h3>
                <p className="text-muted-foreground">Des personnes intéressées près de chez vous vous contacteront directement pour organiser la récupération de l'objet.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground rounded-full p-4 mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Donnez une nouvelle vie</h3>
                <p className="text-muted-foreground">Convenez d'un rendez-vous et faites un heureux en donnant votre objet. Un geste simple pour les autres et pour la planète.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                    <h2 className="text-3xl font-bold mb-4">Pourquoi choisir Gee ?</h2>
                    <p className="text-muted-foreground text-lg">
                        Notre mission est de rendre le don d'objets simple, accessible et gratifiant pour tous.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Recycle className="text-primary"/> Écologique</CardTitle>
                        </CardHeader>
                        <CardContent>
                           Réduisez le gaspillage en prolongeant la durée de vie de vos objets.
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Gift className="text-primary"/> Publication Gratuite</CardTitle>
                        </CardHeader>
                        <CardContent>
                           Publier vos dons est et restera toujours 100% gratuit. Pour contacter les donateurs, vos premiers contacts sont offerts.
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Communautaire</CardTitle>
                        </CardHeader>
                        <CardContent>
                           Rejoignez une communauté d'entraide et de partage dans votre région.
                        </CardContent>
                    </Card>
                </div>
             </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Gee. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
