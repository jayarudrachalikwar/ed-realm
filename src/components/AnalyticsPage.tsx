import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Award,
  Clock,
  Target,
  Activity,
  Download,
  Calendar
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { exportToCSV, exportToPDF } from '../lib/exportUtils';
import { toast } from 'sonner';

interface AnalyticsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function AnalyticsPage({ onNavigate }: AnalyticsPageProps) {
  const [timeRange, setTimeRange] = useState('30d');

  // User Engagement Data
  const userEngagementData = [
    { date: 'Dec 1', active: 145, new: 12, returning: 133 },
    { date: 'Dec 2', active: 158, new: 15, returning: 143 },
    { date: 'Dec 3', active: 142, new: 8, returning: 134 },
    { date: 'Dec 4', active: 168, new: 18, returning: 150 },
    { date: 'Dec 5', active: 175, new: 22, returning: 153 },
  ];

  // Course Performance Data
  const coursePerformanceData = [
    { course: 'DSA Mastery', enrolled: 245, completed: 185, avgScore: 87 },
    { course: 'Web Dev Pro', avgScore: 92, enrolled: 198, completed: 145 },
    { course: 'System Design', avgScore: 78, enrolled: 156, completed: 98 },
    { course: 'React Advanced', avgScore: 85, enrolled: 178, completed: 132 },
    { course: 'Node.js Deep Dive', avgScore: 81, enrolled: 134, completed: 89 },
  ];

  const exportReport = (format: 'excel' | 'pdf') => {
    const headers = ['Course', 'Enrolled', 'Completed', 'Avg Score'];
    const rows = coursePerformanceData.map((course) => [
      course.course,
      course.enrolled,
      course.completed,
      `${course.avgScore}%`,
    ]);

    if (format === 'pdf') {
      exportToPDF('analytics_report', 'Course Performance', headers, rows);
      toast.success('PDF export started');
    } else {
      exportToCSV('analytics_report', headers, rows);
      toast.success('Excel export started');
    }
  };

  // Problem Difficulty Distribution
  const problemDifficultyData = [
    { difficulty: 'Easy', solved: 1250, attempted: 1580 },
    { difficulty: 'Medium', solved: 890, attempted: 1420 },
    { difficulty: 'Hard', solved: 340, attempted: 980 },
  ];

  // Student Performance Radar
  const studentPerformanceRadar = [
    { subject: 'DSA', value: 85 },
    { subject: 'Web Dev', value: 92 },
    { subject: 'Algorithms', value: 78 },
    { subject: 'System Design', value: 75 },
    { subject: 'Databases', value: 88 },
  ];

  // Time Distribution
  const timeDistributionData = [
    { hour: '12 AM', users: 15 },
    { hour: '4 AM', users: 8 },
    { hour: '8 AM', users: 65 },
    { hour: '12 PM', users: 142 },
    { hour: '4 PM', users: 185 },
    { hour: '8 PM', users: 220 },
  ];

  // Submission Status
  const submissionStatusData = [
    { name: 'Accepted', value: 1245, color: '#10B981' },
    { name: 'Wrong Answer', value: 456, color: '#EF4444' },
    { name: 'Time Limit', value: 234, color: '#F59E0B' },
    { name: 'Runtime Error', value: 123, color: '#8B5CF6' },
  ];

  // Revenue Data (mock)
  const revenueData = [
    { month: 'Jul', revenue: 45000, expenses: 32000 },
    { month: 'Aug', revenue: 52000, expenses: 34000 },
    { month: 'Sep', revenue: 61000, expenses: 36000 },
    { month: 'Oct', revenue: 58000, expenses: 35000 },
    { month: 'Nov', revenue: 68000, expenses: 38000 },
    { month: 'Dec', revenue: 75000, expenses: 40000 },
  ];

  const keyMetrics = {
    totalRevenue: 359000,
    revenueGrowth: 15.3,
    activeUsers: 245,
    userGrowth: 12.8,
    avgEngagement: 87,
    engagementChange: 5.2,
    completionRate: 76.5,
    completionChange: -2.3,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Analytics Dashboard</h2>
          <p className="text-neutral-600 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 text-neutral-900">
              <Calendar className="w-4 h-4 mr-2 text-neutral-700" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-neutral-900">
                <Download className="w-4 h-4 mr-2 text-neutral-700" />
                Export Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportReport('excel')}>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportReport('pdf')}>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600">Total Revenue</p>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)' }}>
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              </div>
            </div>
            <h3>${(keyMetrics.totalRevenue / 1000).toFixed(0)}K</h3>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">+{keyMetrics.revenueGrowth}%</span>
              <span className="text-xs text-neutral-500">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600">Active Users</p>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)' }}>
                <Users className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
              </div>
            </div>
            <h3>{keyMetrics.activeUsers}</h3>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">+{keyMetrics.userGrowth}%</span>
              <span className="text-xs text-neutral-500">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600">Avg. Engagement</p>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <Activity className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              </div>
            </div>
            <h3>{keyMetrics.avgEngagement}%</h3>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">+{keyMetrics.engagementChange}%</span>
              <span className="text-xs text-neutral-500">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-neutral-600">Completion Rate</p>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                <Target className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />
              </div>
            </div>
            <h3>{keyMetrics.completionRate}%</h3>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="w-3 h-3 text-red-600" />
              <span className="text-xs text-red-600">{keyMetrics.completionChange}%</span>
              <span className="text-xs text-neutral-500">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6">
          {/* User Engagement Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
                <CardDescription>Active, new, and returning users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userEngagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="active"
                      stackId="1"
                      stroke="#7C3AED"
                      fill="#7C3AED"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="new"
                      stackId="2"
                      stroke="#14B8A6"
                      fill="#14B8A6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Activity Hours</CardTitle>
                <CardDescription>User activity by time of day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="hour" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip />
                    <Bar dataKey="users" fill="#7C3AED" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Submission Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Submission Status Distribution</CardTitle>
                <CardDescription>Breakdown of all code submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={submissionStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {submissionStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Problem Difficulty Analysis</CardTitle>
                <CardDescription>Success rate by difficulty level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={problemDifficultyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="difficulty" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="solved" fill="#10B981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="attempted" fill="#94A3B8" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>Enrollment and completion metrics by course</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={coursePerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#94A3B8" />
                    <YAxis dataKey="course" type="category" stroke="#94A3B8" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="enrolled" fill="#7C3AED" radius={[0, 8, 8, 0]} />
                    <Bar dataKey="completed" fill="#14B8A6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Performance Profile</CardTitle>
                <CardDescription>Average scores across different topics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={studentPerformanceRadar}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" stroke="#94A3B8" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94A3B8" />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#7C3AED"
                      fill="#7C3AED"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Students</CardTitle>
              <CardDescription>Leaderboard for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Emma Wilson', points: 1420, streak: 15, badge: '🏆' },
                  { rank: 2, name: 'Sophia Brown', points: 1320, streak: 12, badge: '🥈' },
                  { rank: 3, name: 'Liam Martinez', points: 1180, streak: 10, badge: '🥉' },
                  { rank: 4, name: 'Isabella Garcia', points: 1150, streak: 8, badge: '' },
                  { rank: 5, name: 'Olivia Taylor', points: 1095, streak: 7, badge: '' },
                ].map((student) => (
                  <div
                    key={student.rank}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white font-semibold text-sm">
                        {student.badge || student.rank}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-neutral-600">
                          {student.streak} day streak
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                        <Award className="w-3 h-3 mr-1" />
                        {student.points} pts
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expenses</CardTitle>
              <CardDescription>Monthly financial overview</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-neutral-600 mb-1">Course Sales</p>
                <h3>$215K</h3>
                <p className="text-sm text-green-600 mt-2">60% of total revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-neutral-600 mb-1">Subscriptions</p>
                <h3>$108K</h3>
                <p className="text-sm text-green-600 mt-2">30% of total revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-neutral-600 mb-1">Other Services</p>
                <h3>$36K</h3>
                <p className="text-sm text-green-600 mt-2">10% of total revenue</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
