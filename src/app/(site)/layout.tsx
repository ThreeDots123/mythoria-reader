import "../globals.css";
import ApplicationFooter from "@/components/footer";
import Navigation from "@/components/navigation";
import { AuthProvider } from "@/contexts/auth-context";
import BannerComponent from "@/components/banner";
import MaintenancePage from "@/components/pages/maintenance";

const MAINTENANCE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (MAINTENANCE) {
    return <MaintenancePage />;
  }

  return (
    <AuthProvider>
      <Navigation />
      <BannerComponent />
      <div className="pb-20 md:pb-0">
        {children}
        <ApplicationFooter />
      </div>
    </AuthProvider>
  );
}
