
"use client"
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Donation } from '@/lib/types';
import type { UserData } from '@/lib/user';
import { getAllUsers, updateUserPlan } from '@/lib/user';
import { deleteDonation, getDonations, toggleDonationFeaturedStatus } from '@/lib/donations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import HomeLayout from '../home/layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ADMIN_ACCESS_CODE = 'Gee2025';

function AdminDashboard() {
  const { toast } = useToast();

  const [users, setUsers] = useState<UserData[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [fetchedUsers, fetchedDonations] = await Promise.all([
        getAllUsers(),
        getDonations()
      ]);
      setUsers(fetchedUsers);
      setDonations(fetchedDonations);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handlePlanChange = async (userId: string, newPlan: 'free' | 'premium') => {
    try {
        await updateUserPlan(userId, newPlan);
        toast({ title: "Succès", description: "Le plan de l'utilisateur a été mis à jour." });
        fetchData();
    } catch (error) {
        toast({ title: "Erreur", description: "Impossible de mettre à jour le plan.", variant: "destructive" });
    }
  };

  const handleDeleteDonation = async (donationId: string) => {
    try {
        await deleteDonation(donationId);
        toast({ title: "Succès", description: "Le don a été supprimé." });
        fetchData();
    } catch (error) {
        toast({ title: "Erreur", description: "Impossible de supprimer le don.", variant: "destructive" });
    }
  };
  
  const handleToggleFeatured = async (donationId: string, currentStatus: boolean) => {
     try {
        await toggleDonationFeaturedStatus(donationId, !currentStatus);
        toast({ title: "Succès", description: "Le statut du don a été modifié." });
        fetchData();
    } catch (error) {
        toast({ title: "Erreur", description: "Impossible de modifier le statut du don.", variant: "destructive" });
    }
  }

  if (loadingData) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord Administrateur</h1>
      
      {/* User Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Gestion des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan Actuel</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.plan === 'premium' ? 'default' : 'secondary'}>
                      {u.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.plan === 'free' ? (
                      <Button size="sm" onClick={() => handlePlanChange(u.id, 'premium')}>
                        Passer en Premium
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handlePlanChange(u.id, 'free')}>
                        Passer en Gratuit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Donation Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des dons</CardTitle>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>{donation.title}</TableCell>
                  <TableCell>{donation.user.name}</TableCell>
                  <TableCell>
                    {donation.isFeatured ? (
                        <Badge>À la une</Badge>
                    ) : (
                        <Badge variant="outline">Standard</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleToggleFeatured(donation.id, donation.isFeatured || false)}>
                        {donation.isFeatured ? 'Retirer' : 'Mettre en avant'}
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm">Supprimer</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action est irréversible et supprimera le don définitivement.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteDonation(donation.id)} className="bg-destructive hover:bg-destructive/90">
                                    Oui, supprimer
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminAccessGate() {
    const [inputCode, setInputCode] = useState('');
    const [accessGranted, setAccessGranted] = useState(false);
    const [error, setError] = useState('');
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputCode === ADMIN_ACCESS_CODE) {
            setAccessGranted(true);
            setError('');
        } else {
            setError('Code d\'accès incorrect.');
        }
    }

    if (accessGranted) {
        return <AdminDashboard />;
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Accès Administrateur</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="access-code">Code d'accès</Label>
                            <Input
                                id="access-code"
                                type="password"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button type="submit" className="w-full">
                            Entrer
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}


export default function AdminPage() {
    return (
        <HomeLayout>
            <AdminAccessGate />
        </HomeLayout>
    )
}
