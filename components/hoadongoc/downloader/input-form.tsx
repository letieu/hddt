"use client";

import { HoadonGocForm, HddtFormInput } from "./hddt-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface InputFormProps {
  onSearch: (data: HddtFormInput) => void;
  isBusy: boolean;
}

export function InputForm({ onSearch, isBusy }: InputFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nhập thông tin tra cứu</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Tìm kiếm</TabsTrigger>
            <TabsTrigger value="upload">Tải lên file XML</TabsTrigger>
          </TabsList>
          <TabsContent value="form">
            <HoadonGocForm onSearch={onSearch} isBusy={isBusy} />
          </TabsContent>
          <TabsContent value="upload">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg mt-4">
              <p>Tải lên file XML để tra cứu hàng loạt.</p>
              <Input type="file" className="mt-4" multiple accept=".xml" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
