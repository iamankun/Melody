"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Palette, Loader2 } from 'lucide-react';

import { findColorForMusic, type FindColorForMusicOutput } from '@/ai/flows/find-color-for-music';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ResultDisplay } from '@/components/shared/result-display';

const formSchema = z.object({
  musicDescription: z.string().min(10, { message: "Vui lòng mô tả âm nhạc chi tiết hơn." }),
});

export function ColorMusic() {
  const [result, setResult] = useState<FindColorForMusicOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      musicDescription: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await findColorForMusic(values);
      setResult(output);
    } catch (error)
    {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Đã xảy ra lỗi',
        description: 'Không thể tìm thấy màu cho nhạc. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const resultText = result ? `Bảng màu:\n${result.colorPalette}\n\nLý do:\n${result.reasoning}` : "";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-accent" />
            <span>Âm nhạc màu sắc</span>
          </CardTitle>
          <CardDescription>Khám phá bảng màu phù hợp với một bản nhạc.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="musicDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả âm nhạc</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Mô tả thể loại, tâm trạng và nhạc cụ của bản nhạc..." {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="min-w-[160px]">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Tìm màu'}
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

      {result && <ResultDisplay title="Bảng màu âm nhạc" content={resultText} />}
    </div>
  );
}
