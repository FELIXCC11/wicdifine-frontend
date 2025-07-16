// wicfin-chatbot/src/components/document-analysis-summary.tsx
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, FileText, CheckCircle, AlertCircle, DollarSign, Briefcase, CreditCard } from 'lucide-react';
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

interface DocumentAnalysisSummaryProps {
  applicationData: any;
  documentFeatures: Record<string, DocumentFeatures>;
}

export function DocumentAnalysisSummary({
  applicationData,
  documentFeatures
}: DocumentAnalysisSummaryProps) {
  const [validation, setValidation] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAllDocuments = async () => {
    setIsValidating(true);
    setError(null);
    try {
      const response = await fetch('/api/validate-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationData,
          documentFeatures,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Document validation failed');
      }
      
      setValidation(data.validation);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  // Format currency values
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get document counts by type
  const getDocumentCounts = () => {
    const counts: Record<string, number> = {};
    Object.values(documentFeatures).forEach(features => {
      features.document_types.forEach(type => {
        counts[type] = (counts[type] || 0) + 1;
      });
    });

    return counts;
  };

  // Format document type for display
  const formatDocumentType = (docType: string) => {
    return docType.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Count total risk flags
  const countRiskFlags = () => {
    return Object.values(documentFeatures).reduce(
      (total, features) => total + features.risk_flags.length, 0
    );
  };

  // Get maximum income from documents
  const getMaxIncome = () => {
    let maxIncome = 0;
    Object.values(documentFeatures).forEach(features => {
      if (features.income && features.income > maxIncome) {
        maxIncome = features.income;
      }
    });

    return maxIncome;
  };

  // Get all discovered employers
  const getEmployers = () => {
    const employers = new Set<string>();
    Object.values(documentFeatures).forEach(features => {
      if (features.employer) {
        employers.add(features.employer);
      }
    });

    return Array.from(employers);
  };

  if (Object.keys(documentFeatures).length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Document Analysis
          </CardTitle>
          <CardDescription>
            No documents have been analyzed yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Upload documents to enable our AI to analyze and verify your application information.
          </p>
        </CardContent>
      </Card>
    );
  }

  const documentCounts = getDocumentCounts();
  const riskFlagCount = countRiskFlags();
  const maxIncome = getMaxIncome();
  const employers = getEmployers();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Document Analysis
        </CardTitle>
        <CardDescription>
          {Object.keys(documentFeatures).length} document{Object.keys(documentFeatures).length !== 1 ? 's' : ''} analyzed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
            <TabsTrigger value="income" className="flex-1">Income</TabsTrigger>
            <TabsTrigger value="employment" className="flex-1">Employment</TabsTrigger>
            <TabsTrigger value="risks" className="flex-1">Risks</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
                  <DollarSign className="h-5 w-5 mb-1 text-green-500" />
                  <span className="text-xs text-muted-foreground">Verified Income</span>
                  <span className="font-medium">{formatCurrency(maxIncome)}</span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
                  <Briefcase className="h-5 w-5 mb-1 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Employers</span>
                  <span className="font-medium">{employers.length}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Document Types</h4>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(documentCounts).map(([type, count], index) => (
                    <Badge key={index} variant="outline">
                      {formatDocumentType(type)} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
              
              {validation ? (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    {validation.is_complete ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    )}
                    <h4 className="text-sm font-medium">
                      Validation {validation.is_complete ? 'Complete' : 'Incomplete'}
                    </h4>
                  </div>
                  
                  {validation.missing_information.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Missing Information:</p>
                      <div className="flex flex-wrap gap-1">
                        {validation.missing_information.map((item: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-amber-500 bg-amber-50 dark:bg-amber-950/30">
                            {item.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={validateAllDocuments}
                  className="w-full py-2 px-4 text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                  disabled={isValidating}
                >
                  {isValidating ? 'Validating...' : 'Validate All Documents'}
                </button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="income">
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Income Documentation</h4>
                <span className="text-xs text-muted-foreground">
                  {Object.values(documentFeatures).filter(f => f.income !== undefined).length} source(s)
                </span>
              </div>
              
              {Object.entries(documentFeatures)
                .filter(([_, features]) => features.income !== undefined)
                .map(([docId, features], index) => (
                  <div key={index} className="p-3 bg-muted rounded-md">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium">
                        {features.document_types[0] 
                          ? formatDocumentType(features.document_types[0]) 
                          : 'Document'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {formatCurrency(features.income)}
                      </Badge>
                    </div>
                    {features.employer && (
                      <div className="text-xs text-muted-foreground">
                        Employer: {features.employer}
                      </div>
                    )}
                  </div>
                ))}
              
              {validation?.inconsistencies?.filter((i: any) => i.field === 'income').length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md">
                  <div className="flex items-center text-amber-500 text-xs mb-1">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span>Income discrepancy detected</span>
                  </div>
                  {validation.inconsistencies
                    .filter((i: any) => i.field === 'income')
                    .map((inconsistency: any, index: number) => (
                      <div key={index} className="text-xs">
                        <span>Declared: {formatCurrency(inconsistency.declared)}</span>
                        <span className="mx-2">vs</span>
                        <span>Documented: {formatCurrency(inconsistency.documented)}</span>
                        <span className="ml-2 text-amber-500">
                          ({inconsistency.discrepancy_percentage}% difference)
                        </span>
                      </div>
                    ))}
                </div>
              )}
              
              {Object.values(documentFeatures).filter(f => f.income !== undefined).length === 0 && (
                <div className="p-3 bg-muted rounded-md text-center text-sm text-muted-foreground">
                  No income information found in uploaded documents
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="employment">
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Employment Information</h4>
                <span className="text-xs text-muted-foreground">
                  {employers.length} employer(s)
                </span>
              </div>
              
              {employers.length > 0 ? (
                employers.map((employer, index) => {
                  // Find all documents that mention this employer
                  const relatedDocs = Object.entries(documentFeatures)
                    .filter(([_, features]) => features.employer === employer);
                  
                  // Get employment type (use the most frequent one if there are conflicts)
                  const employmentTypes = relatedDocs
                    .map(([_, features]) => features.employment_type)
                    .filter(Boolean);
                  
                  const typeCount: Record<string, number> = {};
                  employmentTypes.forEach(type => {
                    if (type) typeCount[type] = (typeCount[type] || 0) + 1;
                  });
                  
                  const mostFrequentType = Object.entries(typeCount)
                    .sort((a, b) => b[1] - a[1])[0]?.[0];
                  
                  // Format the employment type
                  const formatEmploymentType = (type?: string) => {
                    const typeMap: {[key: string]: string} = {
                      'full_time': 'Full-time',
                      'part_time': 'Part-time',
                      'self_employed': 'Self-employed',
                      'retired': 'Retired',
                      'unemployed': 'Unemployed',
                      'unknown': 'Unknown'
                    };
                    
                    return type ? (typeMap[type] || type) : 'Unknown';
                  };
                  
                  return (
                    <div key={index} className="p-3 bg-muted rounded-md">
                      <div className="mb-2">
                        <span className="text-sm font-medium">{employer}</span>
                        <Badge variant="outline" className="ml-2">
                          {formatEmploymentType(mostFrequentType)}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Found in {relatedDocs.length} document(s)
                      </div>
                      
                      {/* Display employment duration if available */}
                      {relatedDocs.some(([_, features]) => features.employment_duration) && (
                        <div className="text-xs mt-1">
                          <span className="text-muted-foreground">Duration: </span>
                          {(() => {
                            const maxDuration = Math.max(
                              ...relatedDocs
                                .map(([_, features]) => features.employment_duration || 0)
                            );
                            
                            const years = Math.floor(maxDuration / 12);
                            const months = maxDuration % 12;
                            
                            return (
                              <span>
                                {years > 0 ? `${years} year${years !== 1 ? 's' : ''}` : ''}
                                {years > 0 && months > 0 ? ', ' : ''}
                                {months > 0 ? `${months} month${months !== 1 ? 's' : ''}` : ''}
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-3 bg-muted rounded-md text-center text-sm text-muted-foreground">
                  No employment information found in uploaded documents
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="risks">
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Risk Indicators</h4>
                <span className="text-xs text-muted-foreground">
                  {riskFlagCount} found
                </span>
              </div>
              
              {riskFlagCount > 0 ? (
                <div>
                  {Object.entries(documentFeatures)
                    .filter(([_, features]) => features.risk_flags.length > 0)
                    .map(([docId, features], docIndex) => (
                      <div key={docIndex} className="mb-3">
                        <div className="text-xs text-muted-foreground mb-1">
                          {features.document_types[0] 
                            ? formatDocumentType(features.document_types[0]) 
                            : 'Document'}:
                        </div>
                        
                        {features.risk_flags.map((flag, flagIndex) => (
                          <TooltipProvider key={flagIndex}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-md mb-2 cursor-help">
                                  <div className="flex items-center text-amber-500 text-xs">
                                    <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0" />
                                    <span className="font-medium">{flag.flag}</span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-xs">{flag.context}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-md flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  <span className="text-sm">No risk indicators found in the documents</span>
                </div>
              )}
              
              {validation?.risk_flags?.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md mt-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center text-amber-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Validation Risks
                  </h4>
                  <ul className="space-y-1">
                    {validation.risk_flags.map((flag: any, index: number) => (
                      <li key={index} className="text-xs text-amber-700">
                        • {flag.flag}: {flag.context}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}