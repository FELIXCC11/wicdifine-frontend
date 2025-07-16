'use client';

import {
  memo,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { ArtifactKind, UIArtifact } from './artifact';
import { FileIcon, FullscreenIcon, ImageIcon, LoaderIcon, AlertTriangle, FileText } from './icons';
import { cn, fetcher } from '@/libs/utils';
import { Document } from '@/libs/db/schema';
import { InlineDocumentSkeleton } from './document-skeleton';
import useSWR from 'swr';
import { Editor } from './text-editor';
import { DocumentToolCall, DocumentToolResult } from './document';
import { CodeEditor } from './code-editor';
import { useArtifact } from '../../hooks/use-artifact';
import equal from 'fast-deep-equal';
import { SpreadsheetEditor } from './sheet-editor';
import { ImageEditor } from './image-editor';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DocumentFeatures {
  income?: number;
  debt?: number;
  assets?: number;
  property_value?: number;
  credit_score?: string;
  employer?: string;
  employment_type?: string;
  employment_duration?: number;
  document_types: string[];
  risk_flags: Array<{flag: string; context: string}>;
  entities: {
    money: string[];
    organizations: string[];
    dates: string[];
    persons: string[];
  };
}

const LoadingSkeleton = ({ artifactKind }: { artifactKind: ArtifactKind }) => (
  <div className="w-full">
    <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-center justify-between dark:bg-muted h-[57px] dark:border-zinc-700 border-b-0">
      <div className="flex flex-row items-center gap-3">
        <div className="text-muted-foreground">
          <div className="animate-pulse rounded-md size-4 bg-muted-foreground/20" />
        </div>
        <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-24" />
      </div>
      <div>
        <FullscreenIcon />
      </div>
    </div>
    {artifactKind === 'image' ? (
      <div className="overflow-y-scroll border rounded-b-2xl bg-muted border-t-0 dark:border-zinc-700">
        <div className="animate-pulse h-[257px] bg-muted-foreground/20 w-full" />
      </div>
    ) : (
      <div className="overflow-y-scroll border rounded-b-2xl p-8 pt-4 bg-muted border-t-0 dark:border-zinc-700">
        <InlineDocumentSkeleton />
      </div>
    )}
  </div>
);
  
interface DocumentPreviewProps {
  isReadonly: boolean;
  result?: any;
  args?: any;
}

export function DocumentPreview({
  isReadonly,
  result,
  args,
}: DocumentPreviewProps) {
  const { artifact, setArtifact } = useArtifact();
  const [documentFeatures, setDocumentFeatures] = useState<DocumentFeatures | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: documents, isLoading: isDocumentsFetching } = useSWR<
    Array<Document>
  >(result ? `/api/document?id=${result.id}` : null, fetcher);

  const previewDocument = useMemo(() => documents?.[0], [documents]);
  const hitboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boundingBox = hitboxRef.current?.getBoundingClientRect();

    if (artifact.documentId && boundingBox) {
      setArtifact((artifact) => ({
        ...artifact,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    }
  }, [artifact.documentId, setArtifact]);

  // Process document text when a new document is loaded
  useEffect(() => {
    const processDocument = async (document: Document) => {
      // Only process text documents
      if (document.kind !== 'text') return;
      
      setIsProcessing(true);
      try {
        const response = await fetch('/api/process-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: document.content,
            documentId: document.id,
          }),
        });
        
        const data = await response.json();
        if (data.success && data.documentFeatures) {
          setDocumentFeatures(data.documentFeatures);
        }
      } catch (error) {
        console.error('Failed to process document:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    if (previewDocument && previewDocument.content) {
      processDocument(previewDocument);
    }
  }, [previewDocument]);

  if (artifact.isVisible) {
    if (result) {
      return (
        <DocumentToolResult
          type="create"
          result={{ id: result.id, title: result.title, kind: result.kind }}
          isReadonly={isReadonly}
        />
      );
    }

    if (args) {
      return (
        <DocumentToolCall
          type="create"
          args={{ title: args.title }}
          isReadonly={isReadonly}
        />
      );
    }
  }

  if (isDocumentsFetching) {
    return <LoadingSkeleton artifactKind={result?.kind ?? args?.kind} />;
  }

  const document: Document | null = previewDocument
    ? previewDocument
    : artifact.status === 'streaming'
      ? {
          title: artifact.title,
          kind: artifact.kind,
          content: artifact.content,
          id: artifact.documentId,
          createdAt: new Date(),
          userId: 'noop',
          visibility: 'private', 
          updatedAt: null
        }
      : null;

  if (!document) return <LoadingSkeleton artifactKind={artifact.kind} />;

  return (
    <div className="relative w-full cursor-pointer">
      <HitboxLayer
        hitboxRef={hitboxRef as RefObject<HTMLDivElement>}
        result={result}
        setArtifact={setArtifact}
      />
      <DocumentHeader
        title={document.title}
        kind={document.kind}
        isStreaming={artifact.status === 'streaming'}
        documentFeatures={documentFeatures}
      />
      <DocumentContent 
        document={document} 
        documentFeatures={documentFeatures}
        isProcessing={isProcessing}
      />
    </div>
  );
}

const PureDocumentHeader = ({
  title,
  kind,
  isStreaming,
  documentFeatures,
}: {
  title: string;
  kind: ArtifactKind;
  isStreaming: boolean;
  documentFeatures?: DocumentFeatures | null;
}) => (
  <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-start sm:items-center justify-between dark:bg-muted border-b-0 dark:border-zinc-700">
    <div className="flex flex-row items-start sm:items-center gap-3">
      <div className="text-muted-foreground">
        {isStreaming ? (
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        ) : kind === 'image' ? (
          <ImageIcon />
        ) : (
          <FileIcon />
        )}
      </div>
      <div className="-translate-y-1 sm:translate-y-0 font-medium flex items-center gap-2">
        {title}
        {documentFeatures && documentFeatures.document_types && documentFeatures.document_types.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {documentFeatures.document_types[0].split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ')}
          </Badge>
        )}
      </div>
    </div>
    <div className="w-8" />
  </div>
);

const DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
  if (prevProps.title !== nextProps.title) return false;
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;
  if (!equal(prevProps.documentFeatures, nextProps.documentFeatures)) return false;
  return true;
});

// Document Analysis Component
const DocumentAnalysis = ({ features, isProcessing = false }: {
  features: DocumentFeatures | null | undefined;
  isProcessing: boolean;
}) => {
  if (isProcessing) {
    return (
      <div className="p-3 bg-muted/30 rounded-md mt-4 animate-pulse">
        <p className="text-sm text-muted-foreground">Analyzing document...</p>
      </div>
    );
  }

  if (!features) {
    return null;
  }

  // Format currency values
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Map employment type to readable format
  const formatEmploymentType = (type?: string) => {
    const typeMap: {[key: string]: string} = {
      'full_time': 'Full-time',
      'part_time': 'Part-time',
      'self_employed': 'Self-employed',
      'retired': 'Retired',
      'unemployed': 'Unemployed',
      'unknown': 'Unknown'
    };
    return type ? (typeMap[type] || type) : 'N/A';
  };

  return (
    <div className="p-3 bg-muted/30 rounded-md mt-4 text-sm">
      <h4 className="font-medium mb-2 text-sm flex items-center">
        <FileText className="h-4 w-4 mr-1" />
        Document Analysis
      </h4>
      
      <div className="grid grid-cols-2 gap-2 mb-2">
        {features.income !== undefined && (
          <div>
            <span className="text-muted-foreground">Income:</span>{' '}
            <span className="font-medium">{formatCurrency(features.income)}</span>
          </div>
        )}
        
        {features.credit_score && (
          <div>
            <span className="text-muted-foreground">Credit Score:</span>{' '}
            <span className="font-medium">{features.credit_score}</span>
          </div>
        )}
        
        {features.debt !== undefined && (
          <div>
            <span className="text-muted-foreground">Debt:</span>{' '}
            <span className="font-medium">{formatCurrency(features.debt)}</span>
          </div>
        )}
        
        {features.employment_type && (
          <div>
            <span className="text-muted-foreground">Employment:</span>{' '}
            <span className="font-medium">{formatEmploymentType(features.employment_type)}</span>
          </div>
        )}
        
        {features.assets !== undefined && (
          <div>
            <span className="text-muted-foreground">Assets:</span>{' '}
            <span className="font-medium">{formatCurrency(features.assets)}</span>
          </div>
        )}
        
        {features.employer && (
          <div>
            <span className="text-muted-foreground">Employer:</span>{' '}
            <span className="font-medium">{features.employer}</span>
          </div>
        )}
      </div>
      
      {features.risk_flags && features.risk_flags.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-amber-500 mt-2">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>{features.risk_flags.length} risk indicator{features.risk_flags.length !== 1 ? 's' : ''} found</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <ul className="list-disc pl-4 text-xs">
                {features.risk_flags.map((flag, i) => (
                  <li key={i}>{flag.flag}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

const DocumentContent = ({
  document,
  documentFeatures,
  isProcessing
}: {
  document: Document;
  documentFeatures: DocumentFeatures | null | undefined;
  isProcessing: boolean;
}) => {
  const { artifact } = useArtifact();

  const containerClassName = cn(
    'overflow-y-scroll border rounded-b-2xl dark:bg-muted border-t-0 dark:border-zinc-700',
    {
      'p-4 sm:px-14 sm:py-16': document.kind === 'text',
      'p-0': document.kind === 'code',
    },
  );

  const commonProps = {
    content: document.content ?? '',
    isCurrentVersion: true,
    currentVersionIndex: 0,
    status: artifact.status,
    saveContent: () => {},
    suggestions: [],
  };

  return (
    <div className={containerClassName} style={{ maxHeight: documentFeatures ? '500px' : '257px' }}>
      {document.kind === 'text' ? (
        <>
          <Editor {...commonProps} onSaveContent={() => {}} />
          {document.kind === 'text' && (
            <DocumentAnalysis features={documentFeatures} isProcessing={isProcessing} />
          )}
        </>
      ) : document.kind === 'code' ? (
        <div className="flex flex-1 relative w-full">
          <div className="absolute inset-0">
            <CodeEditor {...commonProps} onSaveContent={() => {}} />
          </div>
        </div>
      ) : document.kind === 'sheet' ? (
        <div className="flex flex-1 relative size-full p-4">
          <div className="absolute inset-0">
            <SpreadsheetEditor {...commonProps} />
          </div>
        </div>
      ) : document.kind === 'image' ? (
        <ImageEditor
          title={document.title}
          content={document.content ?? ''}
          isCurrentVersion={true}
          currentVersionIndex={0}
          status={artifact.status}
          isInline={true}
        />
      ) : null}
    </div>
  );
};

const PureHitboxLayer = ({
  hitboxRef,
  result,
  setArtifact,
}: {
  hitboxRef: RefObject<HTMLDivElement>;
  result: any;
  setArtifact: (
    updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact),
  ) => void;
}) => {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const boundingBox = event.currentTarget.getBoundingClientRect();

      setArtifact((artifact) =>
        artifact.status === 'streaming'
          ? { ...artifact, isVisible: true }
          : {
              ...artifact,
              title: result.title,
              documentId: result.id,
              kind: result.kind,
              isVisible: true,
              boundingBox: {
                left: boundingBox.x,
                top: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height,
              },
            },
      );
    },
    [setArtifact, result],
  );

  return (
    <div
      className="size-full absolute top-0 left-0 rounded-xl z-10"
      ref={hitboxRef}
      onClick={handleClick}
      role="presentation"
      aria-hidden="true"
    >
      <div className="w-full p-4 flex justify-end items-center">
        <div className="absolute right-[9px] top-[13px] p-2 hover:dark:bg-zinc-700 rounded-md hover:bg-zinc-100">
          <FullscreenIcon />
        </div>
      </div>
    </div>
  );
};

const HitboxLayer = memo(PureHitboxLayer, (prevProps, nextProps) => {
  if (!equal(prevProps.result, nextProps.result)) return false;
  return true;
});