import { Header } from "@/components/header";
import { AuthProvider } from "@/hooks/use-auth";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </AuthProvider>
  );
}
