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
  Settings, 
  Moon, 
  Sun, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Info,
  FileCode,
  Save,
  Download,
  FolderOpen,
  Trash2
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
  const [showSidebar, setShowSidebar] = useState(true);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [memory, setMemory] = useState<number | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const [fileName, setFileName] = useState(`${problem.title} - Solution`);
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);

  const getStarterCode = (lang: string) => {
    return (
      problem.starterCode[lang] ||
      problem.starterCode.python ||
      '// Write your solution here'
    );
  };

  useEffect(() => {
    setCode(getStarterCode(language));
    loadSavedFiles();
  }, [language, problem]);

  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  const loadSavedFiles = () => {
    const files = FileManager.getFilesByProblem(problem.id);
    setSavedFiles(files);
  };

  const buildSimulationMetrics = (sourceCode: string) => {
    const normalizedLength = sourceCode.replace(/\s+/g, '').length;
    return {
      executionTime: Math.max(24, Math.min(180, 24 + Math.floor(normalizedLength / 10))),
      memory: Math.max(18, Math.min(72, 18 + Math.floor(normalizedLength / 30))),
    };
  };

  const buildTestCaseResults = (includeHidden: boolean) => {
    const relevantCases = problem.testCases.filter((testCase) => includeHidden || !testCase.hidden);
    const starterTemplate = getStarterCode(language).replace(/\s+/g, '');
    const normalizedCode = code.replace(/\s+/g, '');
    const wroteCustomSolution = normalizedCode.length > starterTemplate.length && normalizedCode !== starterTemplate;
    const hasSolutionShape = /(return|print|cout|System\.out|printf)/.test(code);
    const passedAll = wroteCustomSolution && hasSolutionShape;
    const metrics = buildSimulationMetrics(code);

    return {
      metrics,
      passedAll,
      results: relevantCases.map((testCase, index) => ({
        testCaseId: testCase.id,
        passed: passedAll,
        actualOutput: passedAll ? testCase.expectedOutput : 'No matching output',
        executionTime: metrics.executionTime + index * 4,
      })),
    };
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running test cases...\n');
    
    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const simulation = buildTestCaseResults(false);
    const results: TestCaseResult[] = simulation.results;
    
    setTestResults(results);
    const passed = results.filter(r => r.passed).length;
    setOutput(
      `Executed ${results.length} test cases\n` +
      `✓ Passed: ${passed}\n` +
      `✗ Failed: ${results.length - passed}\n\n` +
      results.map((r, i) => 
        `Test Case ${i + 1}: ${r.passed ? '✓ Passed' : '✗ Failed'} (${r.executionTime}ms)`
      ).join('\n')
    );
    setExecutionTime(simulation.metrics.executionTime);
    setMemory(simulation.metrics.memory);
    setIsRunning(false);
    
    toast.success(`Ran ${results.length} test cases`);
  };

  const saveFile = () => {
    if (!fileName.trim()) {
      toast.error('Please enter a file name');
      return;
    }

    try {
      FileManager.saveFile(fileName, code, language, problem.id);
      toast.success(`Solution saved as "${fileName}"`);
      setShowSaveDialog(false);
      loadSavedFiles();
    } catch (error) {
      toast.error('Error saving file');
    }
  };

  const downloadFile = (file: SavedFile) => {
    try {
      FileManager.downloadFile(file);
      toast.success(`Downloaded ${file.name}`);
    } catch (error) {
      toast.error('Error downloading file');
    }
  };

  const deleteFile = (id: string, name: string) => {
    if (FileManager.deleteFile(id)) {
      toast.success(`File "${name}" deleted`);
      loadSavedFiles();
    } else {
      toast.error('Error deleting file');
    }
  };

  const loadFile = (file: SavedFile) => {
    const nextLanguage = allowedLanguages.includes(file.language) ? file.language : 'python';
    setCode(file.code);
    setLanguage(nextLanguage);
    setShowFilesDialog(false);
    toast.success(`Loaded "${file.name}"`);
  };

  const submitCode = async () => {
    setIsSubmitting(true);
    setSubmissionStatus('queued');
    toast.info('Submission queued...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmissionStatus('running');
    toast.info('Running all test cases...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const simulation = buildTestCaseResults(true);
    const allPassed = simulation.passedAll;
    setSubmissionStatus(allPassed ? 'accepted' : 'wrong_answer');
    
    const allResults: TestCaseResult[] = simulation.results;
    
    setTestResults(allResults);
    const passed = allResults.filter(r => r.passed).length;
    setExecutionTime(simulation.metrics.executionTime);
    setMemory(simulation.metrics.memory);
    
    setOutput(
      `Submission Results:\n` +
      `Status: ${allPassed ? '✓ ACCEPTED' : '✗ WRONG ANSWER'}\n` +
      `Test Cases: ${passed}/${allResults.length} passed\n` +
      `Execution Time: ${simulation.metrics.executionTime}ms\n` +
      `Memory: ${simulation.metrics.memory}MB\n\n` +
      allResults.map((r, i) => 
        `Test Case ${i + 1}: ${r.passed ? '✓ Passed' : '✗ Failed'} (${r.executionTime}ms)`
      ).join('\n')
    );
    
    setIsSubmitting(false);
    
    if (allPassed) {
      toast.success(`Accepted! +${problem.points} points`, {
        description: `All ${allResults.length} test cases passed`,
      });
    } else {
      toast.error('Wrong Answer', {
        description: `${passed}/${allResults.length} test cases passed`,
      });
    }

    if (currentUser) {
      recordSubmission({
        userId: currentUser.id,
        type: 'problem',
        meta: { problemId: problem.id },
      });
    }
  };

  const getDifficultyColor = () => {
    switch (problem.difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className="h-dvh flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-neutral-200 px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="hidden sm:block">
            <EdRealmLogo size="small" />
          </div>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h4 className="truncate text-sm sm:text-base">{problem.title}</h4>
            <Badge className={`${getDifficultyColor()} shrink-0`}>
              {problem.difficulty}
            </Badge>
            <span className="hidden sm:inline text-sm text-neutral-600">{problem.points} points</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-24 sm:w-32 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="c">C</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            title="Save your solution"
            className="shrink-0"
          >
            <Save className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Save</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilesDialog(true)}
            title="View saved solutions"
            className="shrink-0"
          >
            <FolderOpen className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Files ({savedFiles.length})</span>
            <span className="sm:hidden">{savedFiles.length}</span>
          </Button>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          <Button
            variant="outline"
            onClick={runCode}
            disabled={isRunning || isSubmitting}
            className="shrink-0"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 sm:mr-2" />
            )}
            <span className="hidden sm:inline">Run</span>
          </Button>

          <Button
            onClick={submitCode}
            disabled={isRunning || isSubmitting}
            style={{ backgroundColor: 'var(--color-primary)' }}
            className="shrink-0"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:mr-2" />
            )}
            <span className="hidden sm:inline">Submit</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Problem Description Sidebar */}
        {showSidebar && (
          <div className="w-full md:w-[420px] lg:w-[500px] h-[45dvh] md:h-auto bg-white border-b md:border-b-0 md:border-r border-neutral-200 flex flex-col shrink-0 min-h-0">
            <Tabs defaultValue="description" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                <TabsTrigger value="solutions">Solutions</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="mb-3">Problem Description</h4>
                      <p className="text-neutral-700 whitespace-pre-wrap">{problem.description}</p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="mb-3">Constraints</h4>
                      <ul className="space-y-2">
                        {problem.constraints.map((constraint, i) => (
                          <li key={i} className="flex gap-2 text-sm text-neutral-700">
                            <span className="text-neutral-400">•</span>
                            <span>{constraint}</span>
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
                          <code className="block bg-neutral-100 p-3 rounded text-sm">
                            {problem.sampleInput}
                          </code>
                        </div>
                        <div>
                          <p className="text-sm mb-2">Output:</p>
                          <code className="block bg-neutral-100 p-3 rounded text-sm">
                            {problem.sampleOutput}
                          </code>
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
                        {problem.tags.map(tag => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="submissions" className="flex-1 p-6">
                <p className="text-sm text-neutral-600">Your previous submissions will appear here</p>
              </TabsContent>

              <TabsContent value="solutions" className="flex-1 p-6">
                <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-900">
                    Solutions will be unlocked after you solve the problem or make 3 submission attempts.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Editor and Console */}
        <div className="flex-1 flex flex-col">
          {/* Monaco Editor */}
          <div className="flex-1 relative">
            <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
              <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1 rounded text-xs text-neutral-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Auto-saving
              </div>
            </div>
            <Editor
              height="100%"
              language={language}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                automaticLayout: true,
              }}
            />
          </div>

          {/* Console/Output */}
          <div className="h-56 sm:h-64 border-t border-neutral-200 bg-white">
            <Tabs defaultValue="testcases" className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="results">
                  Results
                  {submissionStatus && (
                    <div className="ml-2">
                      {submissionStatus === 'accepted' && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                      {submissionStatus === 'wrong_answer' && (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      {(submissionStatus === 'queued' || submissionStatus === 'running') && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                    </div>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="testcases" className="flex-1 overflow-auto m-0 p-4">
                <div className="space-y-3">
                  {problem.testCases.filter(tc => !tc.hidden).map((tc, i) => (
                    <Card key={tc.id}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p className="text-sm">Test Case {i + 1}</p>
                          <div>
                            <p className="text-xs text-neutral-600 mb-1">Input:</p>
                            <code className="block text-xs bg-neutral-100 p-2 rounded">
                              {tc.input}
                            </code>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-600 mb-1">Expected Output:</p>
                            <code className="block text-xs bg-neutral-100 p-2 rounded">
                              {tc.expectedOutput}
                            </code>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="output" className="flex-1 overflow-auto m-0 p-4">
                <pre className="text-sm font-mono whitespace-pre-wrap text-neutral-700">
                  {output || 'Run your code to see the output...'}
                </pre>
              </TabsContent>

              <TabsContent value="results" className="flex-1 overflow-auto m-0 p-4">
                {submissionStatus ? (
                  <div className="space-y-4">
                    {/* Status Header */}
                    <div className={`p-4 rounded-lg border-2 ${
                      submissionStatus === 'accepted' 
                        ? 'bg-green-50 border-green-200' 
                        : submissionStatus === 'wrong_answer'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        {submissionStatus === 'accepted' && (
                          <>
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                            <div>
                              <h4 className="text-green-900">Accepted!</h4>
                              <p className="text-sm text-green-700">All test cases passed</p>
                            </div>
                          </>
                        )}
                        {submissionStatus === 'wrong_answer' && (
                          <>
                            <XCircle className="w-8 h-8 text-red-600" />
                            <div>
                              <h4 className="text-red-900">Wrong Answer</h4>
                              <p className="text-sm text-red-700">
                                {testResults.filter(r => r.passed).length}/{testResults.length} test cases passed
                              </p>
                            </div>
                          </>
                        )}
                        {(submissionStatus === 'queued' || submissionStatus === 'running') && (
                          <>
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <div>
                              <h4 className="text-blue-900">
                                {submissionStatus === 'queued' ? 'Queued' : 'Running...'}
                              </h4>
                              <p className="text-sm text-blue-700">Please wait</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Metrics */}
                    {executionTime && memory && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 bg-neutral-50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                            <Clock className="w-4 h-4" />
                            Execution Time
                          </div>
                          <p className="font-mono">{executionTime}ms</p>
                        </div>
                        <div className="p-3 bg-neutral-50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
                            <FileCode className="w-4 h-4" />
                            Memory
                          </div>
                          <p className="font-mono">{memory}MB</p>
                        </div>
                      </div>
                    )}

                    {/* Test Results */}
                    {testResults.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm">Test Case Results</h4>
                        {testResults.map((result, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border ${
                              result.passed
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {result.passed ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                                <span className="text-sm">
                                  Test Case {i + 1}
                                  {i >= problem.testCases.filter(tc => !tc.hidden).length && (
                                    <Badge variant="outline" className="ml-2 text-xs">Hidden</Badge>
                                  )}
                                </span>
                              </div>
                              <span className="text-xs text-neutral-600">
                                {result.executionTime}ms
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600">
                    Submit your code to see detailed results
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Save Solution Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Solution</DialogTitle>
            <DialogDescription>
              Save your solution for this problem. You can download or reload it later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Enter file name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveFile()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveFile}>Save Solution</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saved Files Dialog */}
      <Dialog open={showFilesDialog} onOpenChange={setShowFilesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Your Saved Solutions</DialogTitle>
            <DialogDescription>
              Manage solutions for {problem.title}
            </DialogDescription>
          </DialogHeader>

          {savedFiles.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-neutral-500">No saved solutions for this problem yet. Save your first solution to get started!</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-2 pr-4">
                {savedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      <p className="text-sm text-neutral-500">
                        {file.language} • {FileManager.formatDate(file.lastModified)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadFile(file)}
                        title="Load this solution"
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFile(file)}
                        title="Download solution"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteFile(file.id, file.name)}
                        title="Delete solution"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
