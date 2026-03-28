"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Code, Loader2 } from 'lucide-react';

import { generateCodeSnippet } from '@/ai/flows/generate-code';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ResultDisplay } from '@/components/shared/result-display';

const formSchema = z.object({
  description: z.string().min(10, { message: "Vui lòng cung cấp mô tả chi tiết hơn." }),
  language: z.string().min(1, { message: "Ngôn ngữ là bắt buộc." }),
  framework: z.string().optional(),
});

export function CodeGenerator() {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      language: '',
      framework: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await generateCodeSnippet(values);
      setResult(output.code);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Đã xảy ra lỗi',
        description: 'Không thể tạo mã. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-6 h-6 text-accent" />
            <span>Tạo mã</span>
          </CardTitle>
          <CardDescription>Tạo các đoạn mã bằng nhiều ngôn ngữ và framework khác nhau.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea placeholder="VD: Một thành phần React cho một biểu mẫu đăng nhập với các trường email và mật khẩu" {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngôn ngữ</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: JavaScript, Python" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="framework"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Framework (Tùy chọn)</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: React, FastAPI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="min-w-[160px]">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Tạo mã'}
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

      {result && <ResultDisplay title="Mã được tạo" content={result} isCode={true} />}
    </div>
  );
}
