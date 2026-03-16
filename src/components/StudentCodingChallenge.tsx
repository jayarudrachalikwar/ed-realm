import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ArrowLeft, Play, Copy, Maximize2, RotateCcw, Sun, Moon, ChevronRight, Trophy, Clock, Lock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { useAuth } from '../lib/auth-context';
import { recordSubmission } from '../lib/submission-store';
import { EdRealmLogo } from './EdRealmLogo';

interface StudentCodingChallengeProps {
  challenge: any;
  module: any;
  course: any;
  onNavigate: (page: string, data?: any) => void;
  onBack: () => void;
}

const ExampleCard = ({ example, index }: { example: any; index: number }) => (
  <div className="border border-neutral-200 rounded-lg p-4 bg-white hover:shadow-sm transition">
    <h4 className="font-semibold text-neutral-900 mb-3">Example {index + 1}</h4>
    <div className="space-y-2 font-mono text-sm">
      <div className="text-neutral-700">
        <span className="text-neutral-500">num1:</span> <span className="font-medium">{example.num1}</span>
      </div>
      <div className="text-neutral-700">
        <span className="text-neutral-500">num2:</span> <span className="font-medium">{example.num2}</span>
      </div>
      <div className="text-neutral-700">
        <span className="text-neutral-500">num3:</span> <span className="font-medium">{example.num3}</span>
      </div>
      <div className="border-t border-neutral-200 mt-3 pt-3 text-green-700 font-semibold">
        Output {index + 1}: {example.output}
      </div>
    </div>
  </div>
);

export function StudentCodingChallenge({
  challenge,
  module,
  course,
  onNavigate,
  onBack,
}: StudentCodingChallengeProps) {
  const { currentUser } = useAuth();
  const templates: Record<string, string> = {
    python: 'def solve():\n    # Write your solution here\n    pass\n',
    java: 'class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n',
    cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
    c: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
  };
  const allowedLanguages = ['java', 'python', 'cpp', 'c'];
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [activeTab, setActiveTab] = useState(0);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const [leftPanelWidth, setLeftPanelWidth] = useState(33);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(250);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingBottom, setIsResizingBottom] = useState(false);

  const examples = (challenge && challenge.examples) || [];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 20 && newWidth < 80) setLeftPanelWidth(newWidth);
      }
      if (isResizingBottom) {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight > 100 && newHeight < 600) setBottomPanelHeight(newHeight);
      }
    };
    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingBottom(false);
    };
    if (isResizingLeft || isResizingBottom) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingLeft, isResizingBottom]);

  useEffect(() => {
    if (challenge) {
      const starter = challenge.starterCode || challenge.starter || null;
      if (starter && typeof starter === 'object') {
        const preferred = starter.java ? 'java' : Object.keys(starter)[0];
        const safePreferred = allowedLanguages.includes(preferred) ? preferred : 'java';
        setLanguage(safePreferred);
        setCode(starter[safePreferred] || starter[Object.keys(starter)[0]] || templates[safePreferred] || '// Write your solution here');
      } else if (typeof starter === 'string') {
        setCode(starter);
      } else {
        setCode(templates[language] || '// Write your solution here');
      }
      const cases = (challenge.testCases || []).map((tc: any, i: number) => ({
        id: tc.id || `tc-${i}`,
        input: tc.input || tc.inputExample || '',
        expectedOutput: tc.expectedOutput || tc.expected || '',
        hidden: !!tc.hidden,
      }));
      if (cases.length === 0) setTestCases([{ id: 't1', input: '45 23 67', expectedOutput: '67', hidden: false }]);
      else setTestCases(cases);
      setTestResults([]);
      setLastScore(null);
    }
  }, [challenge]);

  const simulateRun = (includeHidden = false) => {
    const cases = testCases.filter((tc) => (includeHidden ? true : !tc.hidden));
    const results = cases.map((tc) => {
      const passed = (tc.expectedOutput && code.includes(tc.expectedOutput)) || (tc.input && code.includes(tc.input));
      return { ...tc, passed };
    });
    setTestResults(results);
    return results;
  };

  const handleRun = () => {
    const results = simulateRun(false);
    const passed = results.filter((r) => r.passed).length;
    toast.success(`${passed} / ${results.length} visible tests passed`);
  };

  const handleSubmit = () => {
    const results = simulateRun(true);
    const passed = results.filter((r) => r.passed).length;
    const total = results.length || 1;
    const score = Math.round((passed / total) * 100);
    setLastScore(score);
    if (passed === total) toast.success('All tests passed. Full score awarded!');
    else toast('Submission received. Some tests failed. Partial score awarded.');
    if (currentUser) recordSubmission({ userId: currentUser.id, type: 'course_challenge', meta: { challengeId: challenge?.id || 'challenge' } });
  };

  return (
    <div className="fixed inset-0 z-[60] h-screen w-screen flex flex-col bg-white overflow-hidden font-sans uppercase-none">
      <header className="h-16 bg-white border-b border-neutral-100 flex items-center px-8 justify-between shrink-0 shadow-sm z-10 transition-all">
        <div className="flex items-center gap-6">
          <EdRealmLogo size="small" />
          <div className="h-8 w-px bg-neutral-200" />
          <Button variant="ghost" className="text-neutral-500 hover:text-neutral-900 px-3 py-2 h-auto rounded-xl hover:bg-neutral-50 flex items-center transition-all bg-white" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-bold">Back to Module</span>
          </Button>
          <div className="h-8 w-px bg-neutral-200" />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-neutral-400 font-medium uppercase tracking-widest text-[10px]">{course?.name || 'Java Specialization'}</span>
            <ChevronRight className="w-3 h-3 text-neutral-300" />
            <span className="font-black text-neutral-900 uppercase tracking-widest text-[10px]">{challenge?.title || 'Assignment'}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {lastScore !== null && (
            <div className="flex items-center gap-3 bg-neutral-900 text-white px-6 py-2 rounded-2xl shadow-xl animate-in zoom-in duration-500">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-black tracking-widest uppercase">Score: {lastScore}/100</span>
            </div>
          )}
          <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center border border-neutral-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Problem */}
        <div style={{ width: `${leftPanelWidth}%` }} className="bg-white border-r border-neutral-200 overflow-y-auto flex flex-col min-w-[300px] relative shrink-0 shadow-[10px_0_30px_rgba(0,0,0,0.02)]">
          <div onMouseDown={() => setIsResizingLeft(true)} className="absolute right-0 top-0 bottom-0 w-1.5 bg-transparent hover:bg-neutral-900/10 cursor-col-resize z-20 group">
            <div className="w-0.5 h-full bg-neutral-100 group-hover:bg-neutral-400 transition-colors mx-auto" />
          </div>

          <div className="flex-1 p-10 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-neutral-900 text-white px-3 py-1 font-black text-[10px] uppercase tracking-wider">{challenge?.difficulty || 'Medium'}</Badge>
                <div className="flex items-center gap-2 px-2.5 py-0.5 bg-neutral-100 rounded-full border border-neutral-200">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  <span className="text-neutral-600 text-[10px] font-black uppercase tracking-widest">15 Mins</span>
                </div>
              </div>
              <h2 className="text-4xl font-black text-neutral-900 leading-tight tracking-tight">{challenge?.title || 'Coding Challenge'}</h2>
            </div>

            <div className="prose prose-neutral max-w-none">
              <div className="bg-neutral-50/50 rounded-3xl p-8 border border-neutral-100 leading-relaxed text-neutral-600 font-medium text-lg whitespace-pre-wrap">
                {challenge?.description || challenge?.question || 'Implement the solution according to the requirements.'}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-[0.3em] pl-1">Example Cases</h3>
              {testCases.filter(tc => !tc.hidden).slice(0, 2).map((tc, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm space-y-4 group hover:border-neutral-900 transition-all duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-[10px] font-black">{idx + 1}</div>
                    <p className="font-black text-neutral-900 text-[11px] uppercase tracking-widest">Sample Instance</p>
                  </div>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 group-hover:border-neutral-200 transition-colors">
                      <span className="text-neutral-400 mr-4 uppercase text-[10px] font-black block mb-2">Input</span>
                      <span className="text-neutral-900 font-bold">{tc.input}</span>
                    </div>
                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100 group-hover:border-green-200 transition-colors">
                      <span className="text-green-600 mr-4 uppercase text-[10px] font-black block mb-2">Output</span>
                      <span className="text-green-800 font-bold">{tc.expectedOutput}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Editor Area */}
        <div className="flex-1 flex flex-col bg-[#0A0A0A] min-w-0">
          <div className="h-12 bg-[#1A1A1A] flex items-center px-6 justify-between border-b border-white/5 shrink-0">
            <div className="flex items-center gap-6">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32 h-8 bg-[#252526] border-none text-neutral-300 text-[11px] font-black uppercase tracking-widest rounded-lg focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/5 text-neutral-300">
                  {allowedLanguages.map(l => (
                    <SelectItem key={l} value={l} className="uppercase text-[10px] font-black tracking-widest">{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-3 text-neutral-400">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Solution.{language}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button size="icon" variant="ghost" className="w-8 h-8 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg"><RotateCcw className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" className="w-8 h-8 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg"><Maximize2 className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="flex-1 relative min-h-0 bg-[#0A0A0A]">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-neutral-300 font-mono text-[15px] p-10 border-none resize-none focus:ring-0 focus-visible:ring-0 leading-relaxed custom-scrollbar selection:bg-blue-500/30"
              spellCheck={false}
              placeholder="// Write your elite solution here..."
            />
          </div>

          <div onMouseDown={() => setIsResizingBottom(true)} className="h-1 bg-[#252526] hover:bg-neutral-500 cursor-row-resize shrink-0 transition-colors flex items-center justify-center group">
            <div className="w-12 h-0.5 bg-white/10 group-hover:bg-white/40 rounded-full" />
          </div>

          <div style={{ height: bottomPanelHeight }} className="bg-[#141414] flex flex-col shrink-0">
            <div className="h-12 bg-[#1A1A1A] flex items-center px-8 justify-between border-b border-white/5 shrink-0">
              <div className="flex items-center gap-10">
                <button className="text-[10px] font-black text-white uppercase tracking-[0.2em] border-b-2 border-white pb-4 mt-4 transition-all">Test Cases</button>
                <button className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] pb-4 mt-4 transition-all hover:text-white">Console</button>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleRun} className="h-8 bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all">
                  <Play className="w-3 h-3 mr-2" /> Run Test
                </Button>
                <Button onClick={handleSubmit} className="h-8 px-6 bg-white text-black hover:bg-neutral-200 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-xl active:scale-95">
                  Submit
                </Button>
              </div>
            </div>

            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar-dark grid grid-cols-1 md:grid-cols-2 gap-6">
              {testCases.map((tc, idx) => (
                <div key={tc.id || idx} className="bg-[#1A1A1A] rounded-2xl p-6 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Test {idx + 1}</span>
                      {tc.hidden && <Lock className="w-3 h-3 text-neutral-700" />}
                    </div>
                    <div className="text-xs font-mono text-neutral-400">Input: <span className="text-neutral-200">{tc.input}</span></div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${testResults[idx]?.passed ? 'bg-green-500/10 text-green-500' : testResults[idx] ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-neutral-600'}`}>
                      {testResults[idx] ? (testResults[idx].passed ? 'Passed' : 'Failed') : 'Untested'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
