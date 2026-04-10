
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { toast } from 'sonner';
import { ContestParticipation } from './ContestParticipation';
import { loadContests } from '../lib/contest-store';
import {
  Calendar,
  Clock,
  Trophy,
  AlertCircle,
  Zap,
} from 'lucide-react';

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

export function StudentContestDashboard({
  onNavigate,
}: {
  onNavigate?: (page: string, data?: any) => void;
}) {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'past'>('live');
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [isContestMode, setIsContestMode] = useState(false);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [activeContest, setActiveContest] = useState<Contest | null>(null);

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
        { id: 'q1', title: 'Edit Distance', description: 'Transform one string to another.', difficulty: 'medium', topic: 'DP', points: 100, type: 'coding' },
      ],
      createdAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
    },
  ];

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

  const liveContests = contests.filter(c => c.status === 'active');
  const upcomingContests = contests.filter(c => c.status === 'scheduled');

  const handleEnterContest = (c: Contest) => {
    setSelectedContest(c);
    setShowPermissionDialog(true);
  };

  const enrollAndEnter = () => {
    if (!selectedContest) return;
    setContests(prev =>
      prev.map(contest =>
        contest.id === selectedContest.id ? { ...contest, enrolled: true } : contest
      )
    );
    const enrolledContest = { ...selectedContest, enrolled: true };
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

  if (activeContest && isContestMode) {
    return (
      <div className="min-h-screen w-full bg-white">
        <ContestParticipation
          contest={{
            id: activeContest.id,
            title: activeContest.name,
            duration: 180,
            questions: activeContest.questions,
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              Coding Contests
            </h1>
            <p className="text-sm md:text-base text-slate-500">
              Compete with your peers and improve your ranking.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Global Rank</p>
                <p className="text-lg md:text-xl font-bold text-slate-900">#128</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="bg-white border border-slate-200 p-1 mb-8 rounded-xl h-auto shadow-sm inline-flex">
            <TabsTrigger value="live" className="px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold">
              Live Contests
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold">
              Past
            </TabsTrigger>
          </TabsList>

          {/* LIVE */}
          <TabsContent value="live" className="space-y-6">
            {liveContests.map(c => (
              <Card key={c.id} className="overflow-hidden border-slate-200 shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl">
                <div className="p-4 md:p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 lg:gap-8">

                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-red-50 text-red-600 border-red-100 uppercase text-[10px] md:text-xs font-bold px-3 py-1">
                        Live Now
                      </Badge>
                      <span className="text-xs md:text-sm text-slate-400 font-medium">
                        • {c.participants} participants active
                      </span>
                    </div>

                    <div>
                      <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                        {c.name}
                      </h2>
                      <p className="text-sm md:text-base text-slate-500">
                        {c.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold text-slate-700">{c.duration}</span>
                      </div>

                      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-amber-700">{c.prize} Prize Pool</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[240px]">
                    <Button
                      className="w-full py-4 md:py-6 rounded-xl font-bold text-sm md:text-base bg-amber-300 hover:bg-amber-400 text-black"
                      onClick={() => {
                        if (c.enrolled) handleEnterContest(c);
                        else { setSelectedContest(c); setShowEnrollDialog(true); }
                      }}
                    >
                      {c.enrolled ? 'Enter Contest Arena' : 'Register Now'}
                    </Button>

                    <p className="text-[10px] md:text-xs font-semibold text-center uppercase text-indigo-600 bg-indigo-50 py-2 rounded-lg">
                      Ends in 02:45:12
                    </p>
                  </div>

                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
