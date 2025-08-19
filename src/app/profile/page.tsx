
"use client"
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import HomeLayout from '../home/layout';
import { Badge } from '@/components/ui/badge';

function ProfilePageContent() {
    const { user, userData, loading } = useAuth();

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-center">
                <Card className="w-full max-w-lg">
                    <CardHeader className="items-center text-center">
                        <Skeleton className="h-24 w-24 rounded-full mb-4" />
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-5 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-6 w-1/2" />
                       </div>
                       <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                       </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!user) {
        return (
             <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <p>Veuillez vous connecter pour voir votre profil.</p>
            </div>
        );
    }
    
    const currentPlan = userData?.plan || 'free';
    const connectionCode = userData?.connectionCode || 'N/A';
    
    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader className="items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl">{user.displayName}</CardTitle>
                        <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'}>
                            {currentPlan === 'free' ? 'Plan Gratuit' : 'Premium'}
                        </Badge>
                    </div>
                    <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Votre code de connexion</h3>
                        <p className="text-lg font-semibold bg-muted p-2 rounded-md text-center tracking-widest mt-1">{connectionCode}</p>
                        <p className="text-xs text-muted-foreground mt-1">Conservez ce code précieusement, il est nécessaire pour vous connecter.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function ProfilePage() {
    return (
        <HomeLayout>
            <ProfilePageContent />
        </HomeLayout>
    )
}
