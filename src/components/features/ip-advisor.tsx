"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Loader2 } from 'lucide-react';

import { provideIPCopyrightGuidance, type ProvideIPCopyrightGuidanceOutput } from '@/ai/flows/provide-ip-copyright-guidance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ResultDisplay } from '@/components/shared/result-display';

const formSchema = z.object({
  contentDescription: z.string().min(10, { message: "Vui lòng mô tả nội dung chi tiết hơn." }),
  usageContext: z.string().min(10, { message: "Vui lòng mô tả bối cảnh sử dụng chi tiết hơn." }),
  specificQuestion: z.string().optional(),
});

export function IPAdvisor() {
  const [result, setResult] = useState<ProvideIPCopyrightGuidanceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentDescription: '',
      usageContext: '',
      specificQuestion: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await provideIPCopyrightGuidance(values);
      setResult(output);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Đã xảy ra lỗi',
        description: 'Không thể nhận được hướng dẫn IP. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const resultText = result 
    ? `Hướng dẫn:\n${result.guidance}\n\nNhững cân nhắc về sử dụng hợp pháp:\n${result.fairUseConsiderations}\n\nCác tùy chọn cấp phép:\n${result.licensingOptions}\n\nNên tìm tư vấn pháp lý: ${result.legalAdviceRecommendation ? 'Có' : 'Không'}${result.reasonForRecommendation ? `\nLý do: ${result.reasonForRecommendation}` : ''}` 
    : "";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span>Tư vấn IP &amp; Bản quyền</span>
          </CardTitle>
          <CardDescription>Nhận hướng dẫn về các vấn đề sở hữu trí tuệ và bản quyền.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="contentDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả nội dung</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Mô tả nội dung (ví dụ: một bài hát, một đoạn mã, một hình ảnh)." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usageContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bối cảnh sử dụng</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Nội dung này sẽ được sử dụng như thế nào và ở đâu? (ví dụ: trong một sản phẩm thương mại, một video trên YouTube)" {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specificQuestion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Câu hỏi cụ thể (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Bạn có câu hỏi cụ thể nào về bản quyền hoặc cấp phép không?" {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="min-w-[160px]">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Nhận hướng dẫn'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <Card className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Card>
      )}

      {result && <ResultDisplay title="Hướng dẫn về IP &amp; Bản quyền" content={resultText} />}
    </div>
  );
}
