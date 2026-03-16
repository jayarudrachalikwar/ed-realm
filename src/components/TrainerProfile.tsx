import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Mail, Phone, MapPin, Clock, Award, Users } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

export function TrainerProfile() {
  const { currentUser } = useAuth();
  const profile = {
    name: currentUser?.name || 'Trainer',
    email: currentUser?.email || 'trainer@example.com',
    phone: '+1 (555) 123-4567',
    location: 'Remote / Global',
    specialization: 'Algorithms & System Design',
    experience: '6 years',
    students: 180,
    batches: 8,
    bio: 'Dedicated to helping learners build strong problem-solving skills with real-world coding challenges and live feedback.',
    availability: 'Weekdays 6-9 PM, Weekends 10 AM-2 PM',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarFallback style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
            {profile.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-3xl font-bold text-neutral-900">Profile</h2>
          <p className="text-neutral-600 mt-1">Manage your trainer information</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="border-neutral-300 text-neutral-700">{profile.specialization}</Badge>
            <Badge variant="outline" className="border-neutral-300 text-neutral-700">{profile.experience} experience</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input defaultValue={profile.name} />
              </div>
              <div>
                <label className="text-sm font-medium">Specialization</label>
                <Input defaultValue={profile.specialization} />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" defaultValue={profile.email} />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input defaultValue={profile.phone} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Availability</label>
              <Input defaultValue={profile.availability} />
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea rows={4} defaultValue={profile.bio} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>At a Glance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Mail className="w-4 h-4 text-neutral-500" /> {profile.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Phone className="w-4 h-4 text-neutral-500" /> {profile.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <MapPin className="w-4 h-4 text-neutral-500" /> {profile.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Clock className="w-4 h-4 text-neutral-500" /> {profile.availability}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Users className="w-4 h-4 text-neutral-500" /> Students mentored
                </div>
                <span className="font-bold">{profile.students}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <Award className="w-4 h-4 text-neutral-500" /> Batches handled
                </div>
                <span className="font-bold">{profile.batches}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
