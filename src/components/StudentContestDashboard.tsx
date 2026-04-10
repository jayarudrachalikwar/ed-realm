import React, { useState } from 'react';

import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from './ui/tabs';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';

import { toast } from 'sonner';
import { ContestParticipation } from './ContestParticipation';
import { loadContests, Contest as StoreContest } from '../lib/contest-store';

import {
  Calendar,
  Clock,
  Trophy,
  AlertCircle,
  Zap
} from 'lucide-react';


/* ================= TYPES ================= */

interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  points: number;
  type: 'coding' | 'mcq';
}

interface Contest {
  id: string;
  name: string;
  description: string;
  totalQuestions: number;
  startTime: string;
  endTime: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  participants: number;
  questions: Question[];
  createdAt: string;
  duration: string;
  prize?: string;
  enrolled?: boolean;
}


/* ================= COMPONENT ================= */

export function StudentContestDashboard({
  onNavigate
}: {
  onNavigate?: (page: string, data?: any) => void;
}) {

  const [activeTab, setActiveTab] =
    useState<'live' | 'upcoming' | 'past'>('live');

  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const [isContestMode, setIsContestMode] = useState(false);

  const [selectedContest, setSelectedContest] =
    useState<Contest | null>(null);

  const [activeContest, setActiveContest] =
    useState<Contest | null>(null);


  /* ================= DEFAULT DATA ================= */

  const defaultContests: Contest[] = [
    {
      id: '1',
      name: 'Dynamic Programming Contest',
      description: 'Master the art of DP with this intensive challenge.',
      totalQuestions: 5,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3 * 3600000).toISOString(),
      status: 'active',
      participants: 840,
      duration: '3h',
      prize: '₹10,000',
      enrolled: true,
      questions: [
        {
          id: 'q1',
          title: 'Edit Distance',
          description: 'Transform one string to another.',
          difficulty: 'medium',
          topic: 'DP',
          points: 100,
          type: 'coding'
        }
      ],
      createdAt: new Date().toISOString()
    },

    {
      id: '2',
      name: 'Weekly DSA Challenge #12',
      description: 'Test your data structures and algorithms knowledge.',
      totalQuestions: 4,
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 90000000).toISOString(),
      status: 'scheduled',
      participants: 0,
      duration: '1.5h',
      prize: '₹2,000',
      enrolled: false,
      questions: [],
      createdAt: new Date().toISOString()
    }
  ];


  /* ================= STATE ================= */

  const [contests, setContests] = useState<Contest[]>(() => {
    const stored = loadContests();

    const merged = [...(stored as any)];

    defaultContests.forEach(dc => {
      if (!merged.find(mc => mc.id === dc.id)) {
        merged.push(dc);
      }
    });

    return merged;
  });


  /* ================= FILTERS ================= */

  const liveContests = contests.filter(c => c.status === 'active');
  const upcomingContests = contests.filter(c => c.status === 'scheduled');


  /* ================= HANDLERS ================= */

  const handleEnterContest = (c: Contest) => {
    setSelectedContest(c);
    setShowPermissionDialog(true);
  };


  const enrollAndEnter = () => {
    if (!selectedContest) return;

    setContests(prev =>
      prev.map(contest =>
        contest.id === selectedContest.id
          ? { ...contest, enrolled: true }
          : contest
      )
    );

    const enrolledContest = {
      ...selectedContest,
      enrolled: true
    };

    setSelectedContest(enrolledContest);
    setShowEnrollDialog(false);
    setShowPermissionDialog(true);

    toast.success('You are registered. Review permissions to start.');
  };


  const startContest = () => {
    setShowPermissionDialog(false);

    if (onNavigate && selectedContest) {
      onNavigate('contest-play', { contest: selectedContest });
      return;
    }

    setIsContestMode(true);

    if (selectedContest) {
      setActiveContest(selectedContest);
    }
  };


  /* ================= CONTEST MODE ================= */

  if (activeContest && isContestMode) {
    return (
      <div className="min-h-screen w-full bg-white">
        <ContestParticipation
          contest={{
            id: activeContest.id,
            title: activeContest.name,
            duration: 180,
            questions: activeContest.questions
          }}
          onSubmit={() => {
            setActiveContest(null);
            setIsContestMode(false);
          }}
          onExit={() => {
            setActiveContest(null);
            setIsContestMode(false);
          }}
        />
      </div>
    );
  }


  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Coding Contests
            </h1>
            <p className="text-slate-500">
              Compete with your peers and improve your ranking.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="p-4 bg-white rounded-xl border shadow-sm flex items-center gap-4">

              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-indigo-600" />
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase">
                  Global Rank
                </p>
                <p className="text-xl font-bold text-slate-900">
                  #128
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* TABS */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
        >
          <TabsList className="bg-white border p-1 rounded-xl shadow-sm">

            <TabsTrigger value="live">Live Contests</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>

          </TabsList>

          {/* LIVE */}
          <TabsContent value="live" className="space-y-6">
            {liveContests.map(c => (
              <Card key={c.id} className="p-6 rounded-2xl shadow-md">

                <h2 className="text-xl font-bold">{c.name}</h2>
                <p className="text-slate-500">{c.description}</p>

                <Button
                  onClick={() =>
                    c.enrolled
                      ? handleEnterContest(c)
                      : setShowEnrollDialog(true)
                  }
                >
                  {c.enrolled ? 'Enter Contest' : 'Register'}
                </Button>

              </Card>
            ))}
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}
