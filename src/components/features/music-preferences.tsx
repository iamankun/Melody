"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Music, Loader2 } from 'lucide-react';

import { recommendMusic, type RecommendMusicOutput } from '@/ai/flows/recommend-music';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ResultDisplay } from '@/components/shared/result-display';

const formSchema = z.object({
  listeningHistory: z.string().min(10, { message: "Vui lòng cung cấp thêm chi tiết về lịch sử nghe của bạn." }),
  preferences: z.string().min(10, { message: "Vui lòng cung cấp thêm chi tiết về sở thích của bạn." }),
});

export function MusicPreferences() {
  const [result, setResult] = useState<RecommendMusicOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listeningHistory: '',
      preferences: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await recommendMusic(values);
      setResult(output);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Đã xảy ra lỗi',
        description: 'Không thể nhận được đề xuất. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const resultText = result ? `Đề xuất:\n${result.recommendations}\n\nGiải thích:\n${result.explanation}` : "";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-6 h-6 text-accent" />
            <span>Sở thích âm nhạc</span>
          </CardTitle>
          <CardDescription>Nhận đề xuất âm nhạc dựa trên sở thích của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="listeningHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lịch sử nghe</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Mô tả các nghệ sĩ, thể loại và bài hát yêu thích của bạn..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sở thích</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Bạn đang tìm kiếm tâm trạng, nhịp độ hoặc nhạc cụ nào?" {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="min-w-[180px]">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Nhận đề xuất'}
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

      {result && <ResultDisplay title="Đề xuất âm nhạc của bạn" content={resultText} />}
    </div>
  );
}
