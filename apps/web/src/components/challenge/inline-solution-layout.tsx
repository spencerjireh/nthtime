'use client';

import { useState } from 'react';
import {
  Group,
  Panel,
  Separator,
} from 'react-resizable-panels';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MonacoWrapper } from './monaco-wrapper';
import { useEditorStore } from './editor-store-context';
import { getMonacoLanguage } from '@nthtime/editor';
import { cn } from '@/lib/utils';

export default function InlineSolutionLayout() {
  const referenceSolutionFiles = useEditorStore((s) => s.referenceSolutionFiles);
  const metadata = useEditorStore((s) => s.challengeMetadata);
  const hideSolution = useEditorStore((s) => s.hideSolution);

  const files = referenceSolutionFiles
    ? Object.values(referenceSolutionFiles)
    : [];
  const [activeFilePath, setActiveFilePath] = useState(files[0]?.path ?? '');
  const activeFile = files.find((f) => f.path === activeFilePath) ?? files[0];
  const language = activeFile ? getMonacoLanguage(activeFile.path) : 'plaintext';

  if (!files.length) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <Group
          id="nthtime-inline-solution"
          orientation="horizontal"
        >
          <Panel id="inline-solution-prompt" defaultSize="30%" minSize="15%">
            <div className="flex h-full flex-col overflow-y-auto p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Reference Solution
                </span>
              </div>
              {metadata && (
                <>
                  <h2 className="mb-2 font-sans text-lg font-semibold text-foreground">
                    {metadata.title}
                  </h2>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    <Badge variant={metadata.difficulty}>{metadata.difficulty}</Badge>
                    {metadata.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="prose prose-sm prose-invert max-w-none flex-1 text-muted-foreground">
                    {metadata.prompt.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={i} className="font-semibold text-foreground">
                            {line.replace(/\*\*/g, '')}
                          </p>
                        );
                      }
                      if (line.startsWith('- ') || line.match(/^\d+\./)) {
                        return (
                          <p key={i} className="ml-2">
                            {line}
                          </p>
                        );
                      }
                      if (line.trim() === '') return <br key={i} />;
                      return <p key={i}>{line}</p>;
                    })}
                  </div>
                </>
              )}
            </div>
          </Panel>
          <Separator className="w-1 bg-border transition-colors hover:bg-primary active:bg-primary" />
          <Panel id="inline-solution-code" defaultSize="70%" minSize="25%">
            <div className="flex h-full flex-col">
              {files.length > 1 && (
                <div className="flex shrink-0 border-b border-border bg-muted/30">
                  {files.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => setActiveFilePath(file.path)}
                      className={cn(
                        'px-3 py-1.5 text-xs transition-colors',
                        file.path === activeFilePath
                          ? 'bg-background text-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      {file.path}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex-1">
                <MonacoWrapper
                  value={activeFile.content}
                  language={language}
                  theme="vs-dark"
                  options={{ readOnly: true }}
                />
              </div>
            </div>
          </Panel>
        </Group>
      </div>
      <div className="shrink-0 border-t border-border">
        <div className="flex items-center px-4 py-2">
          <Button variant="ghost" size="sm" onClick={hideSolution}>
            &larr; Back to editor
          </Button>
        </div>
      </div>
    </div>
  );
}
