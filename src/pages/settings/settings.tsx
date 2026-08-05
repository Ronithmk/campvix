import { Fragment } from 'react'
import { toast } from 'sonner'
import { Building2, Palette, ShieldCheck, Bell, Plug, CalendarRange, Save, RotateCcw, Zap } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { schools } from '@/mock/schools'
import { NAV_SECTIONS, ACTION_PERMISSION_SECTIONS } from '@/app/nav-config'
import { usePermissionsStore } from '@/store/permissions-store'
import { ROLES, ROLE_LABELS } from '@/types'

const EDITABLE_ROLES = ROLES.filter((r) => r !== 'administrator')

const INTEGRATIONS = [
  { name: 'Google Workspace', desc: 'Sync classrooms, calendars, and mail', enabled: true },
  { name: 'Zoom', desc: 'Host and join online classes', enabled: true },
  { name: 'Razorpay', desc: 'Accept online fee payments', enabled: false },
  { name: 'WhatsApp Business', desc: 'Send parent notifications via WhatsApp', enabled: false },
  { name: 'Twilio SMS', desc: 'Send SMS alerts for attendance and fees', enabled: true },
]

const NOTIF_PREFS = [
  { label: 'Fee payment received', desc: 'Notify accountants when a payment is recorded' },
  { label: 'Low attendance alerts', desc: 'Notify class teachers when attendance drops below 75%' },
  { label: 'New admission submitted', desc: 'Notify admissions team of new applications' },
  { label: 'Assignment due reminders', desc: 'Remind students 24 hours before due date' },
]

export default function SettingsPage() {
  const school = schools[0]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Configure your school's workspace, branding, and preferences."
        actions={
          <Button onClick={() => toast.success('Settings saved')}>
            <Save className="size-4" /> Save changes
          </Button>
        }
      />

      <Tabs defaultValue="school">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="school"><Building2 className="size-3.5" /> School</TabsTrigger>
          <TabsTrigger value="academic"><CalendarRange className="size-3.5" /> Academic Year</TabsTrigger>
          <TabsTrigger value="permissions"><ShieldCheck className="size-3.5" /> Role Permissions</TabsTrigger>
          <TabsTrigger value="theme"><Palette className="size-3.5" /> Theme &amp; Branding</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="size-3.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="integrations"><Plug className="size-3.5" /> Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="school" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>School information</CardTitle>
              <CardDescription>Basic details about your institution</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 pb-6 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>School name</Label>
                <Input defaultValue={school.name} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>City</Label>
                <Input defaultValue={school.city} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Country</Label>
                <Input defaultValue={school.country} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Established year</Label>
                <Input defaultValue={school.establishedYear} type="number" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic year</CardTitle>
              <CardDescription>Manage terms and the active academic calendar</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 pb-6 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Current academic year</Label>
                <Select defaultValue="2026-27">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026-27">2026 - 2027</SelectItem>
                    <SelectItem value="2025-26">2025 - 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Number of terms</Label>
                <Select defaultValue="3">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Semesters</SelectItem>
                    <SelectItem value="3">3 Terms</SelectItem>
                    <SelectItem value="4">4 Quarters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <RolePermissionsMatrix />
        </TabsContent>

        <TabsContent value="theme" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme &amp; branding</CardTitle>
              <CardDescription>Customize the look and feel for your school's workspace</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pb-6">
              <div className="flex items-center gap-3">
                {['#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706'].map((color) => (
                  <button key={color} className="size-9 rounded-full border-2 border-card shadow-sm ring-1 ring-border" style={{ background: color }} />
                ))}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">White-label mode</p>
                  <p className="text-xs text-muted-foreground">Hide CampusFlow branding across the workspace</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
              <CardDescription>Choose what triggers alerts across the school</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border pb-6">
              {NOTIF_PREFS.map((pref) => (
                <div key={pref.label} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect third-party tools to CampusFlow</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border pb-6">
              {INTEGRATIONS.map((i) => (
                <div key={i.name} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.desc}</p>
                  </div>
                  <Switch defaultChecked={i.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function RolePermissionsMatrix() {
  const { hasAccess, toggleAccess, resetToDefaults } = usePermissionsStore()

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Role-based access control</CardTitle>
          <CardDescription>Choose exactly which modules each role can see and open, and which actions they can perform. Administrator always has full access.</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            resetToDefaults()
            toast.success('Role permissions reset to defaults')
          }}
        >
          <RotateCcw className="size-3.5" /> Reset to defaults
        </Button>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="sticky left-0 z-10 bg-secondary/40 p-3 text-left text-xs font-medium text-muted-foreground">Module</th>
                {EDITABLE_ROLES.map((role) => (
                  <th key={role} className="p-3 text-center text-xs font-medium whitespace-nowrap text-muted-foreground">
                    {ROLE_LABELS[role]}
                  </th>
                ))}
                <th className="p-3 text-center text-xs font-medium whitespace-nowrap text-muted-foreground">Administrator</th>
              </tr>
            </thead>
            <tbody>
              {NAV_SECTIONS.map((section) => (
                <Fragment key={section.title}>
                  <tr className="border-b border-border bg-secondary/20">
                    <td colSpan={EDITABLE_ROLES.length + 2} className="px-3 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      {section.title}
                    </td>
                  </tr>
                  {section.items.map((item) => (
                    <tr key={item.url} className="border-b border-border last:border-0 hover:bg-secondary/20">
                      <td className="sticky left-0 z-10 flex items-center gap-2 bg-card p-3 text-foreground">
                        <item.icon className="size-3.5 text-muted-foreground" />
                        {item.title}
                      </td>
                      {EDITABLE_ROLES.map((role) => (
                        <td key={role} className="p-3 text-center">
                          <Checkbox checked={hasAccess(role, item.url)} onCheckedChange={() => toggleAccess(role, item.url)} />
                        </td>
                      ))}
                      <td className="p-3 text-center">
                        <Checkbox checked disabled />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
              {ACTION_PERMISSION_SECTIONS.map((section) => (
                <Fragment key={section.title}>
                  <tr className="border-b border-border bg-secondary/20">
                    <td colSpan={EDITABLE_ROLES.length + 2} className="px-3 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      {section.title}
                    </td>
                  </tr>
                  {section.items.map((item) => (
                    <tr key={item.key} className="border-b border-border last:border-0 hover:bg-secondary/20">
                      <td className="sticky left-0 z-10 flex items-center gap-2 bg-card p-3 text-foreground">
                        <Zap className="size-3.5 text-muted-foreground" />
                        {item.title}
                      </td>
                      {EDITABLE_ROLES.map((role) => (
                        <td key={role} className="p-3 text-center">
                          <Checkbox checked={hasAccess(role, item.key)} onCheckedChange={() => toggleAccess(role, item.key)} />
                        </td>
                      ))}
                      <td className="p-3 text-center">
                        <Checkbox checked disabled />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
