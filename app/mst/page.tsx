import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MstForm } from "@/components/mst-form";

export default function MstPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-20 px-4 bg-gradient-to-b from-background to-card">
          <div className="container mx-auto max-w-6xl text-center">
            <div className="mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                Tra mã số thuế <span className="text-accent">hàng Loạt</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
                Công cụ hỗ trợ tra mã số thuế cá nhân, doanh nghiệp hàng loạt
              </p>

              <MstForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
