import { Leaf, PlusCircle, Search } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex gap-6 md:gap-10">
          <a href="/home" className="flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold text-lg">Gee</span>
          </a>
        </div>
        <div className="flex items-center space-x-2">
           <Button variant="ghost" size="icon" asChild>
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Rechercher</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href="/new-donation">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouveau don
            </Link>
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
