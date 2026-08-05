import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { BookOpen, LifeBuoy, Loader2, Mail, MessageSquare, Search, Send } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { sleep } from '@/lib/utils'

const FAQS = [
  { q: 'How do I add a new student?', a: 'Go to Students → Add Student and fill in the enrollment form. The student will appear in the list immediately.' },
  { q: 'How can I record a fee payment?', a: 'Navigate to Finance → Fee Management, find the invoice, and use the row action menu to record a payment.' },
  { q: 'Can I change a role\'s sidebar permissions?', a: 'Yes — go to Settings → Role Permissions and configure module access per role.' },
  { q: 'How do I export data to CSV?', a: 'Every data table has an Export button in the toolbar that downloads the filtered rows as a CSV file.' },
]

const schema = z.object({
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Please provide more detail (10+ characters)'),
})

type Values = z.infer<typeof schema>

export default function SupportPage() {
  const [search, setSearch] = useState('')
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { subject: '', message: '' } })

  const filteredFaqs = FAQS.filter((f) => f.q.toLowerCase().includes(search.toLowerCase()))

  async function onSubmit() {
    await sleep(600)
    toast.success('Your message has been sent to support')
    form.reset()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Support" description="Get help, browse guides, or contact our team." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Documentation</p>
              <p className="text-xs text-muted-foreground">Guides & tutorials</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <MessageSquare className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Live chat</p>
              <p className="text-xs text-muted-foreground">Avg. response 2 min</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-warning-bg text-warning">
              <LifeBuoy className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Priority support</p>
              <p className="text-xs text-muted-foreground">Enterprise plan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="faq">
        <TabsList>
          <TabsTrigger value="faq">FAQs</TabsTrigger>
          <TabsTrigger value="contact">Contact us</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="mt-4">
          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search help articles..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border pb-6">
              {filteredFaqs.map((f) => (
                <div key={f.q} className="py-4">
                  <p className="text-sm font-medium text-foreground">{f.q}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                <Mail className="size-3.5" /> support@campusflow.app
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="I need help with..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea rows={5} placeholder="Describe your issue in detail..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-fit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    Send message
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
