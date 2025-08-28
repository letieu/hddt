"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Play, CheckCircle } from "lucide-react"

export function AppDemoSection() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const handleExport = async () => {
    setIsExporting(true)
    setExportComplete(false)
    setLogs([])

    const exportLogs = [
      "🔐 Đang xác thực thông tin đăng nhập...",
      "✅ Xác thực thành công",
      "📅 Xử lý khoảng thời gian: 01/01/2024 đến 31/12/2024",
      "🔍 Đang tìm kiếm hóa đơn phù hợp với tiêu chí...",
      "📊 Tìm thấy 2,847 hóa đơn để xuất",
      "📄 Đang tạo file Excel tổng hợp...",
      "📦 Đang đóng gói các file XML hóa đơn...",
      "💾 Đang tạo gói tải xuống...",
      "✅ Xuất hoàn tất! Bắt đầu tải xuống...",
    ]

    for (let i = 0; i < exportLogs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setLogs((prev) => [...prev, exportLogs[i]])
    }

    setIsExporting(false)
    setExportComplete(true)

    // Simulate file download
    setTimeout(() => {
      const link = document.createElement("a")
      link.href = "#"
      link.download = "goi_xuat_hoa_don.zip"
      link.click()
    }, 1000)
  }

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Dùng Thử Công Cụ Xuất</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Xem việc xuất dữ liệu hóa đơn điện tử hàng loạt dễ dàng như thế nào. Điền thông tin và xem phép màu xảy ra.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Cấu Hình Xuất Dữ Liệu
              </CardTitle>
              <CardDescription>
                Nhập thông tin đăng nhập và tiêu chí lọc để xuất dữ liệu hóa đơn điện tử
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Tên Đăng Nhập</Label>
                  <Input id="username" placeholder="ten-dang-nhap" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mật Khẩu</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-from">Từ Ngày</Label>
                  <Input id="date-from" type="date" defaultValue="2024-01-01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to">Đến Ngày</Label>
                  <Input id="date-to" type="date" defaultValue="2024-12-31" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seller-invoice">Số HĐ Người Bán</Label>
                  <Input id="seller-invoice" placeholder="Lọc tùy chọn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyer-invoice">Số HĐ Người Mua</Label>
                  <Input id="buyer-invoice" placeholder="Lọc tùy chọn" />
                </div>
              </div>

              <Button onClick={handleExport} disabled={isExporting} className="w-full" size="lg">
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang Xuất...
                  </>
                ) : exportComplete ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Xuất Hoàn Tất
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Bắt Đầu Xuất
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Log */}
          <Card>
            <CardHeader>
              <CardTitle>Nhật Ký Xuất</CardTitle>
              <CardDescription>Tiến trình thời gian thực của quá trình xuất hóa đơn điện tử</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-80 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-500">Nhấp "Bắt Đầu Xuất" để bắt đầu...</div>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-gray-500 text-xs mt-1">{String(index + 1).padStart(2, "0")}</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    {exportComplete && (
                      <div className="mt-4 p-3 bg-green-900/30 border border-green-500 rounded text-green-300">
                        🎉 Tải xuống bắt đầu tự động! Kiểm tra thư mục tải xuống: goi_xuat_hoa_don.zip
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
