import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import {
  Play,
  Send,
  Moon,
  Sun,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Info,
  FileCode,
  Save,
  Download,
  FolderOpen,
  Trash2,
  BookOpen,
  Code2,
  Terminal,
} from 'lucide-react';
import { Problem, Submission, TestCaseResult } from '../lib/data';
import { toast } from 'sonner';
import Editor from '@monaco-editor/react';
import { FileManager, SavedFile } from '../lib/fileManager';
import { useAuth } from '../lib/auth-context';
import { recordSubmission } from '../lib/submission-store';
import { EdRealmLogo } from './EdRealmLogo';
import { useIsMobile } from './ui/use-mobile';

interface CodeEditorProps {
  problem: Problem;
  onBack: () => void;
}

export function CodeEditor({ problem, onBack }: CodeEditorProps) {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(
    problem.starterCode[language] || problem.starterCode.python || '// Write your solution here'
  );
  const allowedLanguages = ['python', 'java', 'cpp', 'c'];
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [output, setOutput] = useState<string>('');
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<Submission['status'] | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [memory, setMemory] = useState<number | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const [fileName, setFileName] = useState(`${problem.title} - Solution`);
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
  const [mobileTab, setMobileTab] = useState<'problem' | 'editor' | 'tests'>('problem');

  const getStarterCode = (lang: string) =>
    problem.starterCode[lang] || problem.starterCode.python || '// Write your solution here';

  useEffect(() => {
    setCode(getStarterCode(language));
    loadSavedFiles();
  }, [language, problem]);

  const loadSavedFiles = () => {
    setSavedFiles(FileManager.getFilesByProblem(problem.id));
  };

  const buildSimulationMetrics = (sourceCode: string) => {
    const n = sourceCode.replace(/\s+/g, '').length;
    return {
      executionTime: Math.max(24, Math.min(180, 24 + Math.floor(n / 10))),
      memory: Math.max(18, Math.min(72, 18 + Math.floor(n / 30))),
    };
  };

  const buildTestCaseResults = (includeHidden: boolean) => {
    const relevantCases = problem.testCases.filter(tc => includeHidden || !tc.hidden);
    const starterTemplate = getStarterCode(language).replace(/\s+/g, '');
    const normalizedCode = code.replace(/\s+/g, '');
    const wroteCustomSolution = normalizedCode.length > starterTemplate.length && normalizedCode !== starterTemplate;
    const hasSolutionShape = /(return|print|cout|System\.out|printf)/.test(code);
    const passedAll = wroteCustomSolution && hasSolutionShape;
    const metrics = buildSimulationMetrics(code);
    return {
      metrics,
      passedAll,
      results: relevantCases.map((tc, i) => ({
        testCaseId: tc.id,
        passed: passedAll,
        actualOutput: passedAll ? tc.expectedOutput : 'No matching output',
        executionTime: metrics.executionTime + i * 4,
      })),
    };
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running test cases...\n');
    await new Promise(r => setTimeout(r, 1500));
    const simulation = buildTestCaseResults(false);
    const results: TestCaseResult[] = simulation.results;
    setTestResults(results);
    const passed = results.filter(r => r.passed).length;
    setOutput(
      `Executed ${results.length} test cases\n✓ Passed: ${passed}\n✗ Failed: ${results.length - passed}\n\n` +
      results.map((r, i) => `Test Case ${i + 1}: ${r.passed ? '✓ Passed' : '✗ Failed'} (${r.executionTime}ms)`).join('\n')
    );
    setExecutionTime(simulation.metrics.executionTime);
    setMemory(simulation.metrics.memory);
    setIsRunning(false);
    toast.success(`Ran ${results.length} test cases`);
    setMobileTab('tests');
  };

  const saveFile = () => {
    if (!fileName.trim()) { toast.error('Please enter a file name'); return; }
    try {
      FileManager.saveFile(fileName, code, language, problem.id);
      toast.success(`Solution saved as "${fileName}"`);
      setShowSaveDialog(false);
      loadSavedFiles();
    } catch { toast.error('Error saving file'); }
  };

  const downloadFile = (file: SavedFile) => {
    try { FileManager.downloadFile(file); toast.success(`Downloaded ${file.name}`); }
    catch { toast.error('Error downloading file'); }
  };

  const deleteFile = (id: string, name: string) => {
    if (FileManager.deleteFile(id)) { toast.success(`File "${name}" deleted`); loadSavedFiles(); }
    else toast.error('Error deleting file');
  };

  const loadFile = (file: SavedFile) => {
    setCode(file.code);
    setLanguage(allowedLanguages.includes(file.language) ? file.language : 'python');
    setShowFilesDialog(false);
    toast.success(`Loaded "${file.name}"`);
  };

  const submitCode = async () => {
    setIsSubmitting(true);
    setSubmissionStatus('queued');
    toast.info('Submission queued...');
    await new Promise(r => setTimeout(r, 1000));
    setSubmissionStatus('running');
    toast.info('Running all test cases...');
    await new Promise(r => setTimeout(r, 2000));
    const simulation = buildTestCaseResults(true);
    const allPassed = simulation.passedAll;
    setSubmissionStatus(allPassed ? 'accepted' : 'wrong_answer');
    const allResults: TestCaseResult[] = simulation.results;
    setTestResults(allResults);
    const passed = allResults.filter(r => r.passed).length;
    setExecutionTime(simulation.metrics.executionTime);
    setMemory(simulation.metrics.memory);
    setOutput(
      `Submission Results:\nStatus: ${allPassed ? '✓ ACCEPTED' : '✗ WRONG ANSWER'}\n` +
      `Test Cases: ${passed}/${allResults.length} passed\n` +
      `Execution Time: ${simulation.metrics.executionTime}ms\nMemory: ${simulation.metrics.memory}MB\n\n` +
      allResults.map((r, i) => `Test Case ${i + 1}: ${r.passed ? '✓ Passed' : '✗ Failed'} (${r.executionTime}ms)`).join('\n')
    );
    setIsSubmitting(false);
    if (allPassed) toast.success(`Accepted! +${problem.points} points`, { description: `All ${allResults.length} test cases passed` });
    else toast.error('Wrong Answer', { description: `${passed}/${allResults.length} test cases passed` });
    if (currentUser) recordSubmission({ userId: currentUser.id, type: 'problem', meta: { problemId: problem.id } });
    setMobileTab('tests');
  };

  const getDifficultyColor = () => {
    switch (problem.difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
    }
  };

  // ── Problem panel ──
  const problemPanel = (
    <Tabs defaultValue="description" className="flex-1 flex flex-col min-h-0">
      <TabsList className="w-full justify-start rounded-none border-b shrink-0">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="submissions">Submissions</TabsTrigger>
        <TabsTrigger value="solutions">Solutions</TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="flex-1 overflow-hidden m-0 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <h4 className="mb-3">Problem Description</h4>
              <p className="text-neutral-700 whitespace-pre-wrap text-sm">{problem.description}</p>
            </div>
            <Separator />
            <div>
              <h4 className="mb-3">Constraints</h4>
              <ul className="space-y-2">
                {problem.constraints.map((c, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-700">
                    <span className="text-neutral-400">•</span><span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
            <div>
              <h4 className="mb-3">Example</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm mb-2">Input:</p>
                  <code className="block bg-neutral-100 p-3 rounded text-sm">{problem.sampleInput}</code>
                </div>
                <div>
                  <p className="text-sm mb-2">Output:</p>
                  <code className="block bg-neutral-100 p-3 rounded text-sm">{problem.sampleOutput}</code>
                </div>
                <div>
                  <p className="text-sm mb-2">Explanation:</p>
                  <p className="text-sm text-neutral-700">{problem.explanation}</p>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {problem.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
              </div>
            </div>
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="submissions" className="flex-1 p-6 m-0">
        <p className="text-sm text-neutral-600">Your previous submissions will appear here</p>
      </TabsContent>
      <TabsContent value="solutions" className="flex-1 p-6 m-0">
        <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-900">Solutions will be unlocked after you solve the problem or make 3 submission attempts.</p>
        </div>
      </TabsContent>
    </Tabs>
  );

  // ── Tests/Output panel ──
  const testsPanel = (
    <Tabs defaultValue="testcases" className="flex-1 flex flex-col min-h-0">
      <TabsList className="w-full justify-start rounded-none border-b shrink-0">
        <TabsTrigger value="testcases">Test Cases</TabsTrigger>
        <TabsTrigger value="output">Output</TabsTrigger>
        <TabsTrigger value="results">Results</TabsTrigger>
      </TabsList>
      <TabsContent value="testcases" className="flex-1 overflow-auto m-0 p-4">
        <div className="space-y-4">
          {problem.testCases.filter(tc => !tc.hidden).map((tc, i) => (
            <div key={tc.id} className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-white">
              <h4 className="text-sm font-semibold text-neutral-800">Test Case {i + 1}</h4>
              <div className="space-y-1">
                <p className="text-xs text-neutral-500 font-medium">Input:</p>
                <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-3 font-mono text-sm text-neutral-800">{tc.input}</div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-neutral-500 font-medium">Expected Output:</p>
                <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-3 font-mono text-sm text-neutral-800">{tc.expectedOutput}</div>
              </div>
              {testResults[i] && (
                <div className={`flex items-center gap-2 text-sm font-medium ${testResults[i].passed ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults[i].passed
                    ? <><CheckCircle2 className="w-4 h-4" /> Passed</>
                    : <><XCircle className="w-4 h-4" /> Failed</>
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="output" className="flex-1 overflow-auto m-0 p-4">
        <pre className="font-mono text-sm text-neutral-800 whitespace-pre-wrap bg-neutral-50 rounded-xl p-4 min-h-[120px]">
          {output || 'Run your code to see output here...'}
        </pre>
      </TabsContent>
      <TabsContent value="results" className="flex-1 overflow-auto m-0 p-4">
        {submissionStatus ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border-2 ${
              submissionStatus === 'accepted' ? 'bg-green-50 border-green-200'
              : submissionStatus === 'wrong_answer' ? 'bg-red-50 border-red-200'
              : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-3">
                {submissionStatus === 'accepted' && <><CheckCircle2 className="w-7 h-7 text-green-600" /><div><h4 className="text-green-900">Accepted!</h4><p className="text-sm text-green-700">All test cases passed</p></div></>}
                {submissionStatus === 'wrong_answer' && <><XCircle className="w-7 h-7 text-red-600" /><div><h4 className="text-red-900">Wrong Answer</h4><p className="text-sm text-red-700">{testResults.filter(r => r.passed).length}/{testResults.length} passed</p></div></>}
                {(submissionStatus === 'queued' || submissionStatus === 'running') && <><Loader2 className="w-7 h-7 animate-spin text-blue-600" /><div><h4 className="text-blue-900">{submissionStatus === 'queued' ? 'Queued' : 'Running...'}</h4><p className="text-sm text-blue-700">Please wait</p></div></>}
              </div>
            </div>
            {executionTime && memory && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1"><Clock className="w-4 h-4" />Execution Time</div>
                  <p className="font-mono text-sm">{executionTime}ms</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1"><FileCode className="w-4 h-4" />Memory</div>
                  <p className="font-mono text-sm">{memory}MB</p>
                </div>
              </div>
            )}
            {testResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Test Case Results</h4>
                {testResults.map((result, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.passed ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                        <span className="text-sm">Test Case {i + 1}{i >= problem.testCases.filter(tc => !tc.hidden).length && <Badge variant="outline" className="ml-2 text-xs">Hidden</Badge>}</span>
                      </div>
                      <span className="text-xs text-neutral-600">{result.executionTime}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-neutral-600">Submit your code to see detailed results</p>
        )}
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="h-dvh flex flex-col overflow-hidden">

      {/* ── Top Toolbar ── */}
      <div className="bg-white border-b border-neutral-200 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="hidden sm:block"><EdRealmLogo size="small" /></div>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0">
            <ChevronLeft className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="truncate text-sm sm:text-base font-semibold">{problem.title}</h4>
            <Badge className={`${getDifficultyColor()} shrink-0 text-xs`}>{problem.difficulty}</Badge>
            <span className="hidden sm:inline text-sm text-neutral-600">{problem.points} pts</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-20 sm:w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="c">C</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" onClick={() => setShowSaveDialog(true)}>
            <Save className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex" onClick={() => setShowFilesDialog(true)}>
            <FolderOpen className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          <Button variant="outline" size="sm" onClick={runCode} disabled={isRunning || isSubmitting} className="h-8 px-2 sm:px-3">
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline ml-1">Run</span>
          </Button>

          <Button size="sm" onClick={submitCode} disabled={isRunning || isSubmitting} style={{ backgroundColor: 'var(--color-primary)' }} className="h-8 px-2 sm:px-3">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline ml-1">Submit</span>
          </Button>
        </div>
      </div>

{/* ── MOBILE TAB BAR ── */}
<div className="md:hidden flex items-center gap-2 px-3 py-2.5 bg-white border-b border-neutral-200 shrink-0">
  {[
    { id: 'problem', label: 'Problem' },
    { id: 'editor', label: 'Code' },
    { id: 'tests', label: 'Test Cases' },
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
      <div className="md:hidden flex-1 overflow-hidden" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* Problem tab */}
        {mobileTab === 'problem' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {problemPanel}
          </div>
        )}

        {/* Editor tab — flex column: editor fills space, buttons pinned to bottom */}
        {mobileTab === 'editor' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Auto-save badge */}
            <div className="relative shrink-0 h-0">
              <div className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-neutral-900 px-3 py-1 rounded text-xs text-neutral-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Auto-saving
              </div>
            </div>

            {/* Monaco editor — explicit calc height */}
            <div className="flex-1 min-h-0">
              <Editor
                height="calc(100dvh - 160px)"
                language={language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language}
                value={code}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            </div>

            {/* Run + Submit bar — always visible at bottom */}
            <div className="shrink-0 flex gap-2 p-3 bg-white border-t border-neutral-200">
              <Button
                variant="outline"
                onClick={runCode}
                disabled={isRunning || isSubmitting}
                className="flex-1 h-10 font-semibold text-sm"
              >
                {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                {isRunning ? 'Running...' : 'Run'}
              </Button>
              <Button
                onClick={submitCode}
                disabled={isRunning || isSubmitting}
                className="flex-1 h-10 font-semibold text-sm"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        )}

        {/* Tests tab */}
        {mobileTab === 'tests' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {testsPanel}
          </div>
        )}
      </div>

      {/* ── DESKTOP SPLIT LAYOUT ── */}
      <div className="hidden md:flex flex-1 overflow-hidden min-h-0">
        {/* Problem sidebar */}
        <div className="w-[420px] lg:w-[500px] bg-white border-r border-neutral-200 flex flex-col shrink-0 min-h-0">
          {problemPanel}
        </div>

        {/* Editor + Tests */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 relative min-h-0">
            <div className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-neutral-900 px-3 py-1 rounded text-xs text-neutral-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Auto-saving
            </div>
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language}
              value={code}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
              }}
            />
          </div>
          <div className="h-64 lg:h-80 border-t border-neutral-200 flex flex-col shrink-0 min-h-0 bg-white">
            {testsPanel}
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Solution</DialogTitle>
            <DialogDescription>Save your solution for this problem.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Enter file name" value={fileName} onChange={(e) => setFileName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveFile()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={saveFile}>Save Solution</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Files Dialog */}
      <Dialog open={showFilesDialog} onOpenChange={setShowFilesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Your Saved Solutions</DialogTitle>
            <DialogDescription>Manage solutions for {problem.title}</DialogDescription>
          </DialogHeader>
          {savedFiles.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-neutral-500">No saved solutions yet.</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-2 pr-4">
                {savedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      <p className="text-sm text-neutral-500">{file.language} • {FileManager.formatDate(file.lastModified)}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => loadFile(file)}>Load</Button>
                      <Button size="sm" variant="outline" onClick={() => downloadFile(file)}><Download className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => deleteFile(file.id, file.name)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}