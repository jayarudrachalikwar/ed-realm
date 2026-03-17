import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  Moon,
  Expand,
  RefreshCw,
  Plus,
  BookOpen,
  Code,
  Terminal,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useAuth } from '../lib/auth-context';
import { recordSubmission } from '../lib/submission-store';
import { EdRealmLogo } from './EdRealmLogo';

interface CodingChallengeUIProps {
  topicTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  problemDescription: string;
  examples: Array<{
    id: string;
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
    hidden: boolean;
  }>;
  starterCode?: { [language: string]: string };
  onSubmit: (code: string, language: string) => void;
  onBack: () => void;
}

interface TestResult {
  passed: boolean;
  testCasesPassed: number;
  totalTestCases: number;
  failedCase?: { input: string; expected: string; actual: string };
  error?: string;
}

export function CodingChallengeUI({
  topicTitle,
  difficulty,
  problemDescription,
  examples,
  testCases,
  starterCode,
  onSubmit,
  onBack,
}: CodingChallengeUIProps) {
  const { currentUser } = useAuth();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<{ [key: string]: 'passed' | 'failed' | 'running' | null }>({});
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [submitResult, setSubmitResult] = useState<TestResult | null>(null);

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<'problem' | 'editor' | 'tests'>('problem');

  useEffect(() => {
    const templates: Record<string, string> = {
      java: `public class TestClass {\n    public static String printSeries(int n) {\n        // Please write your return statement here\n        String str = "";\n        int i = 2;\n        int j = 2;\n        while (i < n) {\n            if (!str.isEmpty()) {\n                str += ",";\n            }\n            str += i;\n            i = i + j;\n            j += 2;\n        }\n        return str;\n    }\n}`,
      python: `def print_series(n):\n    # Write your solution here\n    return ""\n`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nstring printSeries(int n) {\n    // Write your solution here\n    return "";\n}\n`,
      c: `#include <stdio.h>\n\n// Write your solution here\n`,
    };
    setCode(starterCode?.[language] || templates[language] || templates.java);
  }, [language, starterCode]);

  const evaluateAttempt = () => {
    const normalizedCode = code.replace(/\s+/g, '');
    const starterTemplate = (starterCode?.[language] || '').replace(/\s+/g, '');
    const wroteCustomSolution = normalizedCode.length > starterTemplate.length && normalizedCode !== starterTemplate;
    const hasSolutionShape = /(return|print|cout|System\.out|printf)/.test(code);
    const passedAll = wroteCustomSolution && hasSolutionShape;
    return {
      passedAll,
      results: testCases.reduce<{ [key: string]: 'passed' | 'failed' }>((acc, tc) => {
        acc[tc.id] = passedAll ? 'passed' : 'failed';
        return acc;
      }, {}),
    };
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      const evaluation = evaluateAttempt();
      setTestResults(evaluation.results);
      setIsRunning(false);
      toast.success('Code execution finished');
      setMobileTab('tests');
    }, 1500);
  };

  const handleFinalSubmit = () => {
    setIsRunning(true);
    setTimeout(() => {
      const evaluation = evaluateAttempt();
      const passedCount = Object.values(evaluation.results).filter(r => r === 'passed').length;
      const totalCount = testCases.length;
      setTestResults(evaluation.results);
      const result: TestResult = {
        passed: evaluation.passedAll,
        testCasesPassed: passedCount,
        totalTestCases: totalCount,
        failedCase: passedCount < totalCount ? {
          input: testCases[0].input,
          expected: testCases[0].expectedOutput,
          actual: 'Wrong Answer',
        } : undefined,
      };
      setSubmitResult(result);
      setIsRunning(false);
      setShowResultDialog(true);
      if (currentUser) recordSubmission({ userId: currentUser.id, type: 'course_challenge', meta: { topicTitle } });
    }, 1500);
  };

  // ── Problem panel (shared) ──
  const problemPanel = (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-10">
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Problem Statement</h2>
        <div className="bg-neutral-50 border border-neutral-100 p-4 sm:p-8 rounded-2xl text-center">
          <span className="font-mono text-sm sm:text-xl font-medium text-neutral-800 tracking-widest">
            Series: 2, 4, 8, 14, 22, ..., n
          </span>
        </div>
        <div className="prose prose-neutral max-w-none text-neutral-600 leading-loose">
          <p>The program should print the numbers that are less than a certain number. The maximum number should be taken as a variable input.</p>
          <p>Refer to the sample inputs and outputs to understand the problem better.</p>
          <p className="font-bold text-red-500">Do not delete the main method.</p>
        </div>
        <div className="bg-orange-50/50 border-l-4 border-orange-400 p-4 rounded-r-xl">
          <p className="text-sm font-bold text-orange-800 mb-1">Note:</p>
          <p className="text-sm text-orange-700/80 leading-relaxed">
            The function should accept 'n' as a parameter and return a string containing the series of numbers up to 'n'.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {examples.map((example, idx) => (
          <div key={example.id} className="space-y-3">
            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Example {idx + 1}</h3>
            <div className="border border-neutral-200 rounded-2xl p-4 sm:p-6 bg-white space-y-3 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest w-16 shrink-0 mt-0.5">Input:</span>
                <code className="bg-neutral-100 px-2 py-1 rounded text-xs sm:text-sm font-bold text-neutral-900 break-all">{example.input}</code>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest w-16 shrink-0 mt-0.5">Output:</span>
                <code className="text-xs sm:text-sm font-bold text-neutral-900 break-all">{example.output}</code>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-10" />
    </div>
  );

  // ── Editor panel (shared) ──
  const editorPanel = (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Editor toolbar */}
      <div className="h-14 bg-white border-b border-neutral-200 px-3 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-24 sm:w-32 h-9 border-neutral-200 rounded-lg text-xs font-bold bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="c">C</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400"><RefreshCw className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} className="h-8 w-8 text-neutral-400"><Moon className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400"><Expand className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Code area */}
      <div className="flex-1 relative min-h-0">
        <textarea
          className={`w-full h-full p-4 sm:p-8 font-mono text-xs sm:text-sm leading-relaxed resize-none outline-none ${isDarkMode ? 'bg-[#1e1e1e] text-white' : 'bg-white text-neutral-800'}`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* Mobile run/submit bar */}
      <div className="md:hidden h-12 bg-white border-t border-neutral-200 flex items-center justify-between px-4 shrink-0">
        <Button
          onClick={handleRunCode}
          disabled={isRunning}
          variant="outline"
          className="h-8 px-4 font-bold text-neutral-700 rounded-lg text-xs"
        >
          <Play className="w-3 h-3 mr-1.5" />
          {isRunning ? 'Running...' : 'Run'}
        </Button>
        <Button
          onClick={handleFinalSubmit}
          disabled={isRunning}
          className="h-8 px-5 bg-black text-white hover:bg-neutral-800 rounded-lg text-xs font-bold"
        >
          Submit
        </Button>
      </div>
    </div>
  );

  // ── Tests panel (shared) ──
  const testsPanel = (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div className="h-12 border-b border-neutral-100 flex items-center justify-between px-4 sm:px-6 bg-neutral-50/50 gap-2 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mr-3">Testcases</span>
          {testCases.map((tc, idx) => (
            <button
              key={tc.id}
              onClick={() => setActiveTestCase(idx)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 ${activeTestCase === idx ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-100'}`}
            >
              Case {idx + 1}
            </button>
          ))}
          <button className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-neutral-100 text-neutral-400 shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {/* Desktop run button */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Button onClick={handleRunCode} disabled={isRunning} className="h-8 px-5 bg-white border border-neutral-200 text-neutral-700 font-bold hover:bg-neutral-50 rounded-lg text-xs shadow-sm">
            <Play className="w-3 h-3 mr-2" />
            {isRunning ? 'Running...' : 'Run'}
          </Button>
          <Button onClick={handleFinalSubmit} disabled={isRunning} className="h-8 px-5 bg-black text-white hover:bg-neutral-800 rounded-lg text-xs font-bold">
            Submit
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Input (n)</label>
          <div className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-xl font-mono text-sm font-bold text-neutral-800">
            {testCases[activeTestCase]?.input}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Actual Output</label>
            <div className={`w-full p-4 border rounded-xl font-mono text-sm min-h-[50px] ${
              testResults[testCases[activeTestCase]?.id] === 'passed'
                ? 'bg-green-50 border-green-100 text-green-700 font-bold'
                : testResults[testCases[activeTestCase]?.id] === 'failed'
                ? 'bg-red-50 border-red-100 text-red-600 font-bold'
                : 'bg-white border-neutral-100 text-neutral-400 italic'
            }`}>
              {testResults[testCases[activeTestCase]?.id] === 'passed'
                ? testCases[activeTestCase]?.expectedOutput
                : testResults[testCases[activeTestCase]?.id] === 'failed'
                ? 'Wrong Answer'
                : 'No output yet...'}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Expected Output</label>
            <div className="w-full p-4 bg-green-50/30 border border-green-100 rounded-xl font-mono text-sm font-bold text-green-700 min-h-[50px]">
              {testCases[activeTestCase]?.expectedOutput}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 z-50 w-screen h-dvh flex flex-col ${isDarkMode ? 'dark bg-neutral-900 text-white' : 'bg-white text-neutral-900'} font-sans overflow-hidden`}>

      {/* Header */}
      <header className="border-b border-neutral-100 flex items-center justify-between gap-3 px-3 sm:px-8 py-3 bg-white flex-shrink-0 z-20">
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
          <Button variant="ghost" onClick={onBack} className="p-1 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 rounded-lg shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="hidden sm:block">
            <EdRealmLogo size="small" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-sm sm:text-xl font-bold text-neutral-900 tracking-tight truncate">{topicTitle}</h1>
              <Badge className="bg-white border border-neutral-200 text-neutral-600 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest shadow-sm shrink-0">
                {difficulty}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2 bg-neutral-50 border border-neutral-100 px-4 py-2 rounded-xl">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Score</span>
            <span className="text-sm font-black text-neutral-900">10/10</span>
          </div>
          <Button variant="outline" className="h-8 sm:h-10 rounded-xl px-3 sm:px-5 font-bold text-neutral-600 text-xs sm:text-sm hidden sm:flex">
            View Comments
          </Button>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 sm:ring-4 ring-purple-50">T</div>
        </div>
      </header>

   {/* ── MOBILE TAB BAR ── */}
<div className="md:hidden flex items-center gap-2 px-3 py-2.5 bg-white border-b border-neutral-200 shrink-0">
  {[
    { id: 'problem', label: 'Problem' },
    { id: 'editor', label: 'Code' },
    { id: 'tests', label: 'Tests' },
  ].map(({ id, label }) => (
    <button
      key={id}
      onClick={() => setMobileTab(id as any)}
      className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all text-center ${
        mobileTab === id
          ? 'bg-white text-neutral-900 border-2 border-neutral-900'
          : 'bg-white text-neutral-500 border border-neutral-300'
      }`}
    >
      {label}
    </button>
  ))}
</div>

      {/* ── MOBILE PANELS ── */}
      <div className="md:hidden flex-1 flex flex-col min-h-0 overflow-hidden">
        {mobileTab === 'problem' && (
          <div className="flex-1 overflow-y-auto bg-white">
            {problemPanel}
          </div>
        )}
        {mobileTab === 'editor' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#FAFAFA]">
            {editorPanel}
          </div>
        )}
        {mobileTab === 'tests' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Mobile run/submit */}
            <div className="flex gap-2 p-3 bg-white border-b border-neutral-100">
              <Button onClick={handleRunCode} disabled={isRunning} variant="outline" className="flex-1 h-9 font-bold text-neutral-700 rounded-lg text-xs">
                <Play className="w-3 h-3 mr-1.5" />
                {isRunning ? 'Running...' : 'Run Tests'}
              </Button>
              <Button onClick={handleFinalSubmit} disabled={isRunning} className="flex-1 h-9 bg-black text-white hover:bg-neutral-800 rounded-lg text-xs font-bold">
                Submit
              </Button>
            </div>
            {testsPanel}
          </div>
        )}
      </div>

      {/* ── DESKTOP SPLIT LAYOUT ── */}
      <main className="hidden md:flex flex-1 overflow-hidden min-h-0">
        {/* Left: Problem */}
        <section className="w-[45%] flex flex-col border-r border-neutral-200 bg-white overflow-hidden shrink-0">
          {problemPanel}
        </section>

        {/* Right: Editor + Tests */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA]">
          {editorPanel}
          {/* Tests bottom panel */}
          <div className="h-80 bg-white border-t border-neutral-200 flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.02)] shrink-0">
            {testsPanel}
          </div>
        </section>
      </main>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
          <div className="p-8 sm:p-10 space-y-8">
            <header className="flex flex-col items-center gap-4 text-center">
              {submitResult?.passed ? (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2 animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-2">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
              )}
              <h2 className={`text-3xl font-black tracking-tight ${submitResult?.passed ? 'text-green-700' : 'text-red-700'}`}>
                {submitResult?.passed ? 'Excellent Work!' : 'Almost There!'}
              </h2>
            </header>
            <div className={`p-8 rounded-[24px] text-center space-y-1 ${submitResult?.passed ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-black">{submitResult?.testCasesPassed}</span>
                <span className="text-2xl font-bold opacity-40">/ {submitResult?.totalTestCases}</span>
              </div>
              <p className={`text-xs font-black uppercase tracking-[0.2em] ${submitResult?.passed ? 'text-green-600' : 'text-red-600'}`}>
                Test Cases Passed
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-14 rounded-2xl border-neutral-200 font-bold hover:bg-neutral-50" onClick={() => setShowResultDialog(false)}>
                Try Again
              </Button>
              <Button className="h-14 rounded-2xl bg-black hover:bg-neutral-900 text-white font-bold" onClick={() => { onSubmit(code, language); setShowResultDialog(false); }}>
                Submit Solution
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}