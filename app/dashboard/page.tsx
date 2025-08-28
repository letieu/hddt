import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-6">Tổng quan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gói dịch vụ</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Pro</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Số hoá đơn đã xuất</CardTitle>
          </CardHeader>
          <CardContent>
            <p>1,234</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ngày hết hạn</CardTitle>
          </CardHeader>
          <CardContent>
            <p>2025-12-31</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
