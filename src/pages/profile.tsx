import { toast } from 'sonner'
import { Camera, Mail, Phone, Save, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/store/auth-store'
import { useActiveSchool } from '@/hooks/use-active-school'
import { ROLE_LABELS } from '@/types'
import { initials } from '@/lib/utils'

export default function ProfilePage() {
  const { name, email, role, avatarUrl } = useAuthStore()
  const school = useActiveSchool()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information and account preferences."
        actions={
          <Button onClick={() => toast.success('Profile updated')}>
            <Save className="size-4" /> Save changes
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 sm:flex-row">
          <div className="relative">
            <Avatar className="size-20">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="text-lg">{initials(name)}</AvatarFallback>
            </Avatar>
            <button className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground">
              <Camera className="size-3.5" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
            <h2 className="text-lg font-semibold text-foreground">{name}</h2>
            <p className="text-sm text-muted-foreground">{role ? ROLE_LABELS[role] : 'Guest'} &middot; {school.name}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Update your name and contact details</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 pb-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Full name</Label>
            <Input defaultValue={name} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Email address</Label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" defaultValue={email || 'you@campusflow.app'} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Phone number</Label>
            <div className="relative">
              <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" defaultValue="+91 98765 43210" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Input disabled defaultValue={role ? ROLE_LABELS[role] : ''} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage password and two-factor authentication</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border pb-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Two-factor authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Password</p>
              <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
            </div>
            <Button variant="outline" size="sm">
              Change password
            </Button>
          </div>
        </CardContent>
      </Card>
      <Separator />
    </div>
  )
}
