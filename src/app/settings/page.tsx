"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
             <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Paramètres</CardTitle>
                    <CardDescription>Gérez les paramètres de votre compte.</CardDescription>
                </CardHeader>
                <CardContent>
                   <p>Cette page est en cours de construction.</p>
                </CardContent>
            </Card>
        </div>
    )
}
