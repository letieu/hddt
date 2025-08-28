import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Calendar, FileSpreadsheet, Zap } from "lucide-react"

const features = [
  {
    icon: Download,
    title: "Bulk Export in One Click",
    description:
      "Export thousands of e-invoices from wide date ranges instantly. No more downloading invoices one by one - get everything in a single bundle.",
  },
  {
    icon: FileSpreadsheet,
    title: "Complete Data Bundle",
    description:
      "Get both Excel summary files and original XML invoice files in one download. Perfect for accounting, analysis, and record keeping.",
  },
  {
    icon: Calendar,
    title: "Flexible Date Filtering",
    description:
      "Export data from any date range - days, months, or entire years. Filter by seller/buyer invoice numbers for precise data extraction.",
  },
  {
    icon: Zap,
    title: "Lightning Fast Processing",
    description:
      "Process thousands of invoices in seconds, not hours. Our optimized system handles large datasets efficiently with real-time progress tracking.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Why choose our e-invoice export tool?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Powerful features designed to make bulk e-invoice data export simple, fast, and comprehensive.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
