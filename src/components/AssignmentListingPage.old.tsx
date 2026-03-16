import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { TopicQuestion } from '../lib/data';
import { toast } from 'sonner';

interface AssignmentListingPageProps {
  assignment: TopicQuestion;
  moduleName: string;
  courseName: string;
  onSelectTopic: (topic: any) => void;
  onBack: () => void;
}

export function AssignmentListingPage({
  assignment,
  moduleName,
  courseName,
  onSelectTopic,
  onBack,
}: AssignmentListingPageProps) {
  // Mock topics data based on assignment
  const topics = [
    {
      id: 'topic-1',
      title: 'Series – Level 1',
      questionsCompleted: 3,
      totalQuestions: 3,
      status: 'submitted',
      submittedDate: 'Sunday, November 30, 2025 11:55 PM',
      difficulty: 'Easy',
      duration: '15m',
    },
    {
      id: 'topic-2',
      title: 'Series – Level 2',
      questionsCompleted: 2,
      totalQuestions: 2,
      status: 'submitted',
      submittedDate: 'Sunday, November 30, 2025 11:55 PM',
      difficulty: 'Medium',
      duration: '25m',
    },
    {
      id: 'topic-3',
      title: 'Series – Level 3',
      questionsCompleted: 0,
      totalQuestions: 3,
      status: 'pending',
      submittedDate: null,
      difficulty: 'Hard',
      duration: '30m',
    },
  ];

  const handleRetakeTest = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info(`Starting retake for topic: ${topicId}`);
  };

  const handleSelectTopic = (topic: any) => {
    onSelectTopic(topic);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="p-6 border-b border-neutral-100">
        <Button
          variant="ghost"
          className="text-neutral-600 hover:text-neutral-900 p-0 h-auto font-medium"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-neutral-900">
              {assignment.question || 'Assignment'} – 1
            </h1>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-full px-4 py-1.5 font-semibold text-sm">
              Submitted
            </Badge>
          </div>
          <div className="text-sm font-medium text-neutral-600">
            Sunday, November 30, 2025 11:55 PM
          </div>
        </div>

        {/* Topics Table Card */}
        <Card className="rounded-2xl border border-neutral-200 shadow-sm bg-white overflow-hidden mb-8">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50 border-neutral-200 hover:bg-neutral-50">
                <TableHead className="py-4 px-6 font-bold text-neutral-700 uppercase tracking-widest text-xs">
                  Topic
                </TableHead>
                <TableHead className="py-4 px-6 font-bold text-neutral-700 uppercase tracking-widest text-xs">
                  Questions
                </TableHead>
                <TableHead className="py-4 px-6 font-bold text-neutral-700 uppercase tracking-widest text-xs">
                  Status
                </TableHead>
                <TableHead className="py-4 px-6 text-right font-bold text-neutral-700 uppercase tracking-widest text-xs">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((topic) => (
                <TableRow
                  key={topic.id}
                  className="group border-neutral-100 hover:bg-neutral-50/50 cursor-pointer transition-all"
                  onClick={() => handleSelectTopic(topic)}
                >
                  <TableCell className="py-5 px-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-900 text-base group-hover:text-orange-600 transition-colors">
                        {topic.title}
                      </span>
                      <span className="text-xs text-neutral-500 mt-1">{topic.difficulty}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <span className="font-semibold text-neutral-700 text-sm">
                      {topic.questionsCompleted}/{topic.totalQuestions} Completed
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <Badge className={`rounded-full px-4 py-1.5 font-semibold text-xs uppercase border-none ${
                      topic.status === 'submitted'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {topic.status === 'submitted' ? 'Submitted' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full h-9 px-4 font-semibold text-sm text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetakeTest(topic.id, e);
                        }}
                      >
                        Retake Test
                      </Button>
                      <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Bottom Right CTA */}
        <div className="flex justify-end">
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 py-3 h-auto font-bold text-base shadow-md group transition-all flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
            <div className="flex flex-col gap-2 items-end">
              <Badge className="bg-green-100 text-green-700 rounded-full px-4 py-2 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submitted
              </Badge>
              <div className="text-sm text-neutral-600 font-medium">
                Sunday, November 30, 2025 11:55 PM
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-8">
        {/* Performance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-sm border-neutral-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold">Completion</p>
                  <p className="text-2xl font-bold text-neutral-900">{completionPercentage}%</p>
                </div>
              </div>
              <Progress value={completionPercentage} className="mt-4" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-neutral-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold">Questions</p>
                  <p className="text-2xl font-bold text-neutral-900">{completedQuestions}/{totalQuestions}</p>
                </div>
              </div>
              <p className="text-xs text-green-600 font-medium mt-4">All completed</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-neutral-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold">Time Spent</p>
                  <p className="text-2xl font-bold text-neutral-900">{totalTime}m</p>
                </div>
              </div>
              <p className="text-xs text-orange-600 font-medium mt-4">Total duration</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-neutral-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold">Topics</p>
                  <p className="text-2xl font-bold text-neutral-900">{submittedTopics}/{topics.length}</p>
                </div>
              </div>
              <p className="text-xs text-purple-600 font-medium mt-4">Submitted</p>
            </CardContent>
          </Card>
        </div>

        {/* Topics Table Card */}
        <Card className="shadow-md border-neutral-200">
          <CardHeader className="bg-neutral-50 border-b border-neutral-200">
            <CardTitle className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Topics Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-200 bg-neutral-50">
                    <TableHead className="text-left font-bold text-neutral-900 w-1/3">Topic</TableHead>
                    <TableHead className="text-center font-bold text-neutral-900 w-1/6">Questions</TableHead>
                    <TableHead className="text-center font-bold text-neutral-900 w-1/6">Status</TableHead>
                    <TableHead className="text-center font-bold text-neutral-900 w-1/4">Action</TableHead>
                    <TableHead className="text-right font-bold text-neutral-900 w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topics.map((topic, idx) => (
                    <TableRow
                      key={topic.id}
                      className="hover:bg-neutral-50 border-neutral-200 cursor-pointer transition"
                      onClick={() => handleSelectTopic(topic)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-semibold text-neutral-900 hover:text-orange-500 transition">
                            {topic.title}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {topic.difficulty} • {topic.duration}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-neutral-900 font-medium">
                          {topic.questionsCompleted}/{topic.totalQuestions} Completed
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            topic.status === 'submitted'
                              ? 'bg-green-100 text-green-700 rounded-full'
                              : 'bg-yellow-100 text-yellow-700 rounded-full'
                          }
                        >
                          {topic.status === 'submitted' ? 'Submitted' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleRetakeTest(topic.id, e)}
                          className="text-neutral-700 hover:bg-neutral-100 border-neutral-300"
                        >
                          Retake Test
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <ChevronRight className="w-5 h-5 text-neutral-400" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Review & Feedback Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-md border-neutral-200">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-50 border-b border-blue-100">
              <CardTitle className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Review Solutions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-neutral-600 mb-4">
                Review your answers and see detailed explanations for each question.
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 font-semibold">
                View Detailed Review →
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md border-neutral-200">
            <CardHeader className="bg-gradient-to-br from-green-50 to-green-50 border-b border-green-100">
              <CardTitle className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                  <p className="text-sm font-semibold text-green-900 mb-1">Great Job! 🎉</p>
                  <p className="text-sm text-green-700">
                    You completed all questions successfully. Your average time per question was better than expected.
                  </p>
                </div>
                <Button variant="outline" className="w-full font-semibold border-green-200 text-green-700 hover:bg-green-50">
                  View Full Analytics →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps Section */}
        <Card className="shadow-md border-neutral-200 bg-gradient-to-br from-orange-50 to-orange-50">
          <CardHeader className="border-b border-orange-100">
            <CardTitle className="text-lg font-bold text-neutral-900">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-neutral-700 mb-6">
              Excellent progress! You've completed this assignment. Here are your next recommended actions:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-orange-100">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                <div>
                  <p className="font-semibold text-neutral-900">Attempt Practice Problems</p>
                  <p className="text-sm text-neutral-600 mt-1">Solidify your knowledge with additional practice questions</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-orange-100">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                <div>
                  <p className="font-semibold text-neutral-900">Move to Next Assignment</p>
                  <p className="text-sm text-neutral-600 mt-1">Progress to the next module and continue learning</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-orange-100">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                <div>
                  <p className="font-semibold text-neutral-900">Review Weak Areas</p>
                  <p className="text-sm text-neutral-600 mt-1">Focus on topics where you spent more time</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center gap-4 pt-4 border-t border-neutral-200">
          <Button
            variant="outline"
            className="border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            onClick={onBack}
          >
            ← Previous Assignment
          </Button>
          <div className="flex gap-4">
            <Button variant="outline" className="border-neutral-300 text-neutral-700 hover:bg-neutral-100">
              Review Solutions
            </Button>
            <Button
              className="rounded-lg px-8 font-semibold"
              style={{ backgroundColor: 'var(--color-warning)' }}
            >
              Next Assignment →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
