import React from 'react';
import { useAuth } from '../lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface ProfileDraft {
  displayName: string;
  email: string;
  phone: string;
  timezone: string;
  bio: string;
}

const STORAGE_KEY = 'codify_profile_drafts';

const loadDraft = (userId: string, fallback: ProfileDraft): ProfileDraft => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, ProfileDraft>) : {};
    return parsed[userId] || fallback;
  } catch {
    return fallback;
  }
};

const saveDraft = (userId: string, draft: ProfileDraft) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, ProfileDraft>) : {};
    parsed[userId] = draft;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore storage failures for this mock profile form.
  }
};

export function AccountProfile() {
  const { currentUser } = useAuth();

  const initialDraft = React.useMemo<ProfileDraft>(
    () => ({
      displayName: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: '',
      timezone: 'Asia/Kolkata',
      bio: '',
    }),
    [currentUser?.email, currentUser?.name]
  );

  const [draft, setDraft] = React.useState<ProfileDraft>(initialDraft);

  React.useEffect(() => {
    if (!currentUser) {
      return;
    }

    setDraft(loadDraft(currentUser.id, initialDraft));
  }, [currentUser, initialDraft]);

  if (!currentUser) {
    return null;
  }

  const handleSave = () => {
    saveDraft(currentUser.id, draft);
    toast.success('Profile details saved');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900">Profile</h2>
          <p className="text-neutral-600 mt-1">Manage your account information for mobile and desktop.</p>
        </div>
        <Badge variant="outline" className="w-fit capitalize">
          {currentUser.role}
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{draft.displayName || currentUser.name}</CardTitle>
            <CardDescription>{currentUser.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-neutral-100 p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Account role</div>
              <div className="mt-2 text-lg font-semibold capitalize text-neutral-900">{currentUser.role}</div>
            </div>
            <div className="rounded-2xl border border-neutral-200 p-4 text-sm text-neutral-600">
              Updates saved here are stored locally in this demo workspace so your profile remains consistent after refresh.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>These fields are shared across mobile and desktop views.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={draft.displayName}
                  onChange={(event) => setDraft((prev) => ({ ...prev, displayName: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailAddress">Email address</Label>
                <Input
                  id="emailAddress"
                  value={draft.email}
                  onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone</Label>
                <Input
                  id="phoneNumber"
                  value={draft.phone}
                  onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="Add a contact number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeZone">Timezone</Label>
                <Input
                  id="timeZone"
                  value={draft.timezone}
                  onChange={(event) => setDraft((prev) => ({ ...prev, timezone: event.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={6}
                value={draft.bio}
                onChange={(event) => setDraft((prev) => ({ ...prev, bio: event.target.value }))}
                placeholder="Add a short introduction for your LMS profile"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Save profile</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
