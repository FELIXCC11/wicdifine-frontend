// wicfin-chatbot/src/components/document-requirements.tsx
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Upload, FileText, AlertCircle } from 'lucide-react';

// API function to determine required documents
async function determineRequiredDocuments({
  applicationData,
  submittedDocuments,
}: {
  applicationData: any;
  submittedDocuments: string[];
}): Promise<{
  success: boolean;
  requiredDocuments?: string[];
  error?: string;
}> {
  try {
    const response = await fetch('/api/determine-required-documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationData,
        submittedDocuments,
      }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to determine required documents');
    }

    return {
      success: true,
      requiredDocuments: data.requiredDocuments,
    };
  } catch (error) {
    console.error('Error determining required documents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

interface DocumentRequirementsProps {
  applicationData: any;
  submittedDocuments: string[];
  onUploadClick: () => void;
}

export function DocumentRequirements({
  applicationData,
  submittedDocuments,
  onUploadClick
}: DocumentRequirementsProps) {
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequiredDocuments() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await determineRequiredDocuments({
          applicationData,
          submittedDocuments,
        });
        
        if (result.success && result.requiredDocuments) {
          setRequiredDocuments(result.requiredDocuments);
        } else {
          setError(result.error || 'Failed to determine required documents');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequiredDocuments();
  }, [applicationData, submittedDocuments]);

  // Format document type for display
  const formatDocumentType = (docType: string) => {
    return docType.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Get a description for each document type
  const getDocumentDescription = (docType: string) => {
    const descriptions: {[key: string]: string} = {
      'IDENTITY_DOCUMENT': 'Driver\'s license, passport, or other government-issued ID',
      'W2': 'W-2 form from your employer showing annual income',
      'PAYSTUB': 'Recent pay stubs (last 30 days)',
      'TAX_RETURN': 'Federal tax returns for the last 2 years',
      'BANK_STATEMENT': 'Bank statements for the last 2-3 months',
      'CREDIT_REPORT': 'Credit report or score documentation',
      'PROPERTY_APPRAISAL': 'Property appraisal or valuation document',
      'MORTGAGE_STATEMENT': 'Current mortgage statement (if refinancing)',
      'ASSET_STATEMENT': 'Statements showing your assets (retirement, investments, etc.)',
      'UTILITY_BILL': 'Recent utility bill showing your name and address'
    };
    return descriptions[docType] || 'Supporting documentation for your application';
  };

  if (isLoading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <CardTitle className="text-lg">Required Documents</CardTitle>
          <CardDescription>Loading document requirements...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-amber-300 dark:border-amber-700">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
            Required Documents
          </CardTitle>
          <CardDescription>Unable to load document requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error}. Please try again later or contact support.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Required Documents
        </CardTitle>
        <CardDescription>
          {requiredDocuments.length === 0
            ? "All required documents have been submitted!"
            : `${requiredDocuments.length} document${requiredDocuments.length !== 1 ? 's' : ''} needed to complete your application`}
        </CardDescription>
      </CardHeader>
      {requiredDocuments.length > 0 && (
        <CardContent>
          <div className="space-y-4">
            {requiredDocuments.map((docType, index) => (
              <div key={index} className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{formatDocumentType(docType)}</p>
                  <p className="text-xs text-muted-foreground">{getDocumentDescription(docType)}</p>
                </div>
                <Badge variant="outline" className="ml-2">Required</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      )}
      
      <CardFooter className={requiredDocuments.length === 0 ? "pt-2" : ""}>
        {requiredDocuments.length === 0 ? (
          <div className="w-full flex items-center justify-center text-green-500">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>All documents submitted</span>
          </div>
        ) : (
          <Button onClick={onUploadClick} className="w-full" variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}