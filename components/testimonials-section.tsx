import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "David Kim",
    role: "Finance Director",
    company: "RetailMax Corp",
    content:
      "This tool saved us 40+ hours per month. We can now export entire year's worth of e-invoice data in minutes instead of days.",
    rating: 5,
  },
  {
    name: "Lisa Martinez",
    role: "Accounting Manager",
    company: "GlobalTrade Ltd",
    content:
      "The Excel + XML bundle format is perfect for our audits. Having both summary data and original files in one download is a game-changer.",
    rating: 5,
  },
  {
    name: "Ahmed Hassan",
    role: "Operations Head",
    company: "TechSupply Inc",
    content:
      "We process thousands of invoices monthly. This bulk export tool eliminated our biggest data management bottleneck completely.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4 text-balance">
            Trusted by finance teams worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            See how our e-invoice export tool is helping businesses streamline their data management.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-background border-border">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="text-card-foreground mb-4 text-pretty">"{testimonial.content}"</blockquote>
                <div className="border-t pt-4">
                  <div className="font-semibold text-card-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
