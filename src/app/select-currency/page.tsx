
"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { CurrencyData, getCurrencyData } from '@/services/currency-service';
import { updateUserCurrency } from '@/lib/user';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AuthProvider } from '@/hooks/use-auth';

function SelectCurrencyPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [currencyData, setCurrencyData] = useState<CurrencyData | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoadingCurrencies(true);
        const data = await getCurrencyData();
        setCurrencyData(data);
      } catch (error) {
        console.error("Failed to fetch currency data", error);
        toast({ title: "Erreur", description: "Impossible de charger les devises.", variant: "destructive" });
      } finally {
        setLoadingCurrencies(false);
      }
    };
    fetchCurrencies();
  }, [toast]);

  const handleSaveCurrency = async () => {
    if (!user || !selectedCurrency) {
      toast({ title: "Erreur", description: "Veuillez sélectionner une devise.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await updateUserCurrency(user.uid, selectedCurrency);
      toast({ title: "Succès", description: "Votre devise a été enregistrée." });
      router.push('/home');
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'enregistrer votre choix.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || loadingCurrencies;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currencyList = currencyData ? Object.entries(currencyData.names)
    .sort(([, a], [, b]) => a.localeCompare(b))
    .map(([code, name]) => ({
      value: code,
      label: `${name} (${code})`
    })) : [];

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Choisissez votre devise</CardTitle>
          <CardDescription>
            Cette devise sera utilisée pour afficher les prix dans l'application, comme pour l'abonnement Premium.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {loadingCurrencies || !currencyData ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="w-full justify-between"
                  >
                    {selectedCurrency
                      ? currencyList.find((currency) => currency.value === selectedCurrency)?.label
                      : "Sélectionnez une devise..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Rechercher une devise..." />
                    <CommandList>
                      <CommandEmpty>Aucune devise trouvée.</CommandEmpty>
                      <CommandGroup>
                        {currencyList.map((currency) => (
                          <CommandItem
                            key={currency.value}
                            value={currency.value}
                            onSelect={(currentValue) => {
                              setSelectedCurrency(currentValue.toUpperCase() === selectedCurrency ? null : currentValue.toUpperCase())
                              setPopoverOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCurrency === currency.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {currency.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <Button onClick={handleSaveCurrency} disabled={!selectedCurrency || isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Enregistrer et continuer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SelectCurrencyPage() {
    return (
        <AuthProvider>
            <SelectCurrencyPageContent />
        </AuthProvider>
    )
}
