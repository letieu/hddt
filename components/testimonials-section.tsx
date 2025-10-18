import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="py-24 px-4 bg-gradient-to-b from-background to-muted/30"
    >
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-center text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          Khách hàng nói gì về chúng tôi
        </h2>
        <p className="mt-4 text-center text-lg text-muted-foreground max-w-2xl mx-auto">
          Cảm ơn Khách hàng đã tin tưởng và sử dụng sản phẩm của chúng tôi.
        </p>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Anh Nguyên",
              text: "Phần mềm rất ngon, mà giá rẻ hơn hẳn các bên khác.",
              img: "/testimonial/01.jpg",
            },
            {
              name: "Anh Minh",
              text: "Phần mềm tải số lượng lớn rất ổn định.",
              img: "/testimonial/02.jpg",
            },
            {
              name: "Anh Tuân",
              text: "Phần mềm dùng OK, hỗ trợ quá OK.",
              img: "/testimonial/03.jpg",
            },
          ].map((testimonial, i) => (
            <Card
              key={i}
              className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-card border border-border/40 py-0"
            >
              <CardHeader className="relative h-[432px] w-full">
                <Image
                  src={testimonial.img}
                  alt={testimonial.name}
                  fill
                  className="object-cover object-center rounded-t-2xl"
                />
              </CardHeader>
              <CardContent className="text-center pb-1">
                <CardTitle className="text-lg font-semibold">
                  {testimonial.name}
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  “{testimonial.text}”
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
