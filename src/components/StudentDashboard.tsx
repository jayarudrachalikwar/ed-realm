import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Trophy, Clock, CheckCircle2, TrendingUp, ArrowRight, Calendar, Code, Users, Flame } from 'lucide-react';
import { problems, courses, batches, assessments } from '../lib/data';
import { toast } from 'sonner';


interface StudentDashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

export function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const [sessionDetailsOpen, setSessionDetailsOpen] = useState(false);
  const studentProgress = 65;
  const currentStreak = 7;
  const solvedProblems = 23;
  const totalPoints = 1850;

  const recentSubmissions = [
    { id: 'sub-1', problemTitle: 'Two Sum', status: 'accepted', points: 100, time: '2 hours ago' },
    { id: 'sub-2', problemTitle: 'Valid Parentheses', status: 'accepted', points: 120, time: '1 day ago' },
    { id: 'sub-3', problemTitle: 'Merge Intervals', status: 'wrong_answer', points: 0, time: '2 days ago' },
  ];

  const upcomingSession = {
    title: 'Advanced Algorithms - Trees & Graphs',
    date: 'Monday, Oct 20, 2025',
    time: '6:00 PM - 8:00 PM',
    instructor: 'Dr. Sarah Johnson',
  };

  const recommendedProblems = problems.slice(0, 3);
  const studentAssessments = assessments.filter(assessment => assessment.batchId === 'batch-1'); // Assuming student is in batch-1


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl">Welcome back, Emma! Let's start with backend development 👋</h2>
        <p className="text-neutral-600 mt-1">
          Here's your learning progress and upcoming activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Course Progress</p>
                <h3 className="mt-1">{studentProgress}%</h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)' }}>
                <TrendingUp className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
              </div>
            </div>
            <Progress value={studentProgress} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Problems Solved</p>
                <h3 className="mt-1">{solvedProblems}</h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <CheckCircle2 className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
              </div>
            </div>
            <p className="text-sm text-neutral-600 mt-2">+3 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Current Streak</p>
                <h3 className="mt-1">{currentStreak} days</h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                <Flame className="w-6 h-6" style={{ color: 'var(--color-warning)' }} />
              </div>
            </div>
            <p className="text-sm text-neutral-600 mt-2">Keep it going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Points</p>
                <h3 className="mt-1">{totalPoints.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)' }}>
                <Trophy className="w-6 h-6" style={{ color: 'var(--color-secondary)' }} />
              </div>
            </div>
            <p className="text-sm text-neutral-600 mt-2">Rank #12</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Live Session */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-danger)' }} />
                  <CardTitle>Upcoming Live Session</CardTitle>
                </div>
                <Badge variant="outline" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
                  In 2 days
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4>{upcomingSession.title}</h4>
                  <div className="flex items-center gap-4 mt-3 text-sm text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {upcomingSession.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {upcomingSession.time}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-neutral-600">
                    <Users className="w-4 h-4" />
                    Instructor: {upcomingSession.instructor}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button style={{ backgroundColor: 'var(--color-primary)' }} onClick={() => {
                    toast.success('Joining session... Please wait');
                    setTimeout(() => toast.info('Live session will start in 2 days'), 1000);
                  }}>
                    Join Session
                  </Button>
                  <Button variant="outline" onClick={() => setSessionDetailsOpen(true)}>View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Submissions</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('problems')}>
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Code className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="font-medium">{submission.problemTitle}</p>
                        <p className="text-sm text-neutral-500">{submission.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {submission.status === 'accepted' ? (
                        <>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Accepted
                          </Badge>
                          <span className="text-sm">+{submission.points} pts</span>
                        </>
                      ) : (
                        <Badge variant="outline" className="border-red-300 text-red-600">
                          Wrong Answer
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Problems */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>
                Based on your progress and learning path
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendedProblems.map((problem) => (
                  <div
                    key={problem.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    onClick={() => onNavigate('problem', problem)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{problem.title}</p>
                        <Badge
                          variant="outline"
                          className={
                            problem.difficulty === 'easy'
                              ? 'border-green-300 text-green-700'
                              : problem.difficulty === 'medium'
                                ? 'border-yellow-300 text-yellow-700'
                                : 'border-red-300 text-red-700'
                          }
                        >
                          {problem.difficulty}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {problem.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-1 rounded bg-neutral-100 text-neutral-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-neutral-600">{problem.points} pts</span>
                      <ArrowRight className="w-4 h-4 text-neutral-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>


          {/* Assessments */}
          {studentAssessments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assessments</CardTitle>
                <CardDescription>
                  Tests and assessments for your batch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentAssessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        toast.info('Assessment feature coming soon!');
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{assessment.name}</p>
                          <Badge
                            variant="outline"
                            className={
                              assessment.status === 'published'
                                ? 'border-green-300 text-green-700'
                                : 'border-yellow-300 text-yellow-700'
                            }
                          >
                            {assessment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-neutral-600 mt-1">{assessment.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                          <span>Duration: {assessment.duration} mins</span>
                          <span>Total Marks: {assessment.totalMarks}</span>
                          <span>Questions: {assessment.questions.length}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-600">{assessment.category}</span>
                        <ArrowRight className="w-4 h-4 text-neutral-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Batch */}
          <Card
            className="cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => onNavigate('problems')}
          >
            <CardHeader>
              <CardTitle>Current Batch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-base">{batches[0].name}</h4>
                  <p className="text-sm text-neutral-600 mt-1">{courses[0].title}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Progress</span>
                    <span>{studentProgress}%</span>
                  </div>
                  <Progress value={studentProgress} />
                </div>
                <div className="pt-2 space-y-2 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {batches[0].schedule}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {batches[0].students} students
                  </div>
                </div>
                <Button style={{ backgroundColor: 'var(--color-primary)' }} className="w-full">
                  View Problems
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>
                See how you rank among your peers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => onNavigate('leaderboard')} variant="outline" className="w-full">
                View Leaderboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Monacco */}
          <Card>
            <CardHeader>
              <CardTitle>Monacco</CardTitle>
              <CardDescription>
                Practice programs with Monaco Editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => onNavigate('code-practice')} style={{ backgroundColor: 'var(--color-primary)' }} className="w-full">
                Start Practicing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <p className="text-sm">Solved <strong>Two Sum</strong></p>
                    <p className="text-xs text-neutral-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)' }}>
                    <Trophy className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <p className="text-sm">Earned <strong>Speed Solver</strong> badge</p>
                    <p className="text-xs text-neutral-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)' }}>
                    <Users className="w-4 h-4" style={{ color: 'var(--color-secondary)' }} />
                  </div>
                  <div>
                    <p className="text-sm">Joined discussion on <strong>Binary Search</strong></p>
                    <p className="text-xs text-neutral-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Session Details Dialog */}
      <Dialog open={sessionDetailsOpen} onOpenChange={setSessionDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>Upcoming live session information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 rounded-lg space-y-3">
              <h4 className="font-semibold">{upcomingSession.title}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <span>{upcomingSession.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <span>{upcomingSession.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-500" />
                  <span>Instructor: {upcomingSession.instructor}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Topics Covered</h5>
              <ul className="text-sm text-neutral-600 list-disc list-inside space-y-1">
                <li>Binary Trees & Binary Search Trees</li>
                <li>Tree Traversals (DFS, BFS)</li>
                <li>Graph Representations</li>
                <li>Graph Algorithms Introduction</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Prerequisites</h5>
              <p className="text-sm text-neutral-600">Complete "Introduction to Trees" module before the session.</p>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                style={{ backgroundColor: 'var(--color-primary)' }}
                onClick={() => {
                  toast.success('Added to calendar');
                  setSessionDetailsOpen(false);
                }}
              >
                Add to Calendar
              </Button>
              <Button variant="outline" onClick={() => setSessionDetailsOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
