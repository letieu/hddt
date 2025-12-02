import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Công cụ này hoạt động như thế nào?",
    answer:
      "Bạn chỉ cần cung cấp thông tin đăng nhập vào hoadondientu.gdt.gov.vn, công cụ sẽ tự động truy cập và tải về tất cả các hóa đơn  dạng XML, HTML, PDF, tự động tạo file excel tổng hợp, bảng kê, danh sách sản phẩm.",
  },
  {
    question: "Việc cung cấp thông tin đăng nhập có an toàn không?",
    answer:
      "Chúng tôi cam kết bảo mật thông tin của bạn. Mọi thông tin đăng nhập đều được mã hóa và chỉ được sử dụng cho mục đích tải hóa đơn. Chúng tôi không lưu trữ mật khẩu của bạn sau khi quá trình tải hoàn tất.",
  },
  {
    question: "Có giới hạn lượt tải, số lượng mã số thuế không?",
    answer:
      "Hiện tại, chúng tôi không giới hạn lượt tải hay số lượng mã số thuế. Bạn có thể sử dụng dịch vụ của chúng tôi để tải hóa đơn cho nhiều mã số thuế khác nhau mà không gặp bất kỳ hạn chế nào.",
  },
  {
    question: "Có hỗ trợ bảng kê không?",
    answer:
      "Có, công cụ của chúng tôi tự động tạo bảng kê chi tiết các hóa đơn đã tải về, dễ dàng kê khai thuế và quản lý.",
  },
  {
    question: "Có tải được hóa đơn gốc không?",
    answer: (
      <span>
        Công cụ tải hóa đơn gốc được phát triển độc lập tại địa chỉ{" "}
        <a
          className="text-blue"
          href="https://taihoadon.online/tai-hoa-don-goc"
        >
          https://taihoadon.online/tai-hoa-don-goc
        </a>{" "}
        . Vui lòng truy cập trang web để sử dụng dịch vụ tải hóa đơn gốc.
      </span>
    ),
  },
  {
    question: "Sau khi tải, tôi sẽ nhận được những gì?",
    answer: `Sau khi quá trình tải hoàn tất, bạn sẽ nhận được 1 file Excel và 1 file nén (ZIP).
        - File Excel bao gồm: 
            + (Hóa đơn điện tử/ hóa đơn từ máy tính tiền) + chi tiết sp từng hóa đơn
            + Danh sách sản phẩm
            + Bảng kê hóa đơn
            + File tổng hợp danh sách hóa đơn
        - File nén (ZIP) bao gồm tất cả các hóa đơn ở định dạng XML, HTML, PDF.
    `,
  },
  {
    question: "Chi phí sử dụng dịch vụ là bao nhiêu?",
    answer:
      "Chúng tôi cung cấp nhiều gói dịch vụ linh hoạt, bao gồm cả gói miễn phí cho người dùng có nhu cầu thấp. Bạn có thể xem chi tiết bảng giá tại phần Bảng giá.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Câu hỏi thường gặp
        </h2>
        <Accordion
          type="single"
          collapsible
          className="w-full max-w-3xl mx-auto"
        >
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent className="whitespace-pre-wrap">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
