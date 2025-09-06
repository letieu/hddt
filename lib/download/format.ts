export const invoiceStatusTitle: Record<number, string> = {
  1: "Hóa đơn mới",
  2: "Hóa đơn thay thế",
  3: "Hóa đơn điều chỉnh",
  4: "Hóa đơn đã bị thay thế",
  5: "Hóa đơn đã bị điều chỉnh",
  6: "Hóa đơn đã bị hủy",
};

export const invoiceCheckResultTitlte: Record<number, string> = {
  0: "Tổng cục Thuế đã nhận",
  1: "Đang tiến hành kiểm tra điều kiện cấp mã",
  2: "CQT từ chối hóa đơn theo từng lần phát sinh",
  3: "Hóa đơn đủ điều kiện cấp mã",
  4: "Hóa đơn không đủ điều kiện cấp mã",
  5: "Đã cấp mã hóa đơn",
  6: "Tổng cục thuế đã nhận không mã",
  7: "Đã kiểm tra định kỳ HĐĐT không có mã",
  8: "Tổng cục thuế đã nhận hóa đơn có mã khởi tạo từ máy tính tiền",
};

export const invoiceItemTypeTitle: Record<number, string> = {
  1: "Hàng hóa, dịch vụ",
  2: "Khuyến mại",
  4: "Ghi chú, diễn giải",
};

export function timeStampToDate(time: number) {
  return new Date(time).toLocaleString("vi-VN");
}

export const invoiceQueryTypeNames = {
  query: "Hóa đơn điện tử",
  "sco-query": "Hóa đơn có mã từ máy tính tiền",
};

export const invoiceTypeNames = {
  purchase: "Mua vào",
  sold: "Bán ra",
};

export function formatDateForFilename(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
}
