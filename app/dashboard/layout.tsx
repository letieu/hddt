import { DashboardHeader } from "@/components/dashboard-header";
import { Footer } from "@/components/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <DashboardHeader />
      <main className="p-10 max-w-6xl mx-auto">{children}</main>
      <Footer />
    </div>
  );
}
