'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, CheckCircle, DollarSign, Clock } from 'lucide-react';
import { LoanOption, LoanApplicationData } from '@/types/ai'; // Import the types we defined

interface LoanApplicationArtifactProps {
  applicationData: LoanApplicationData;
  onApply: () => void;
}

export function LoanApplicationArtifact({ 
  applicationData, 
  onApply 
}: LoanApplicationArtifactProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Format currency with commas
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Handle the submit action
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      onApply();
    }, 1500);
  };

  // Create the display for the loan application
  return (
    <Card className="w-full border-2 border-primary/30 mb-4">
      <CardHeader className="bg-primary/5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Loan Application</CardTitle>
          {applicationData.blockchainVerified ? (
            <Badge variant="outline" className="bg-green-500/10 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              WICchain Secured
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30">
              <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
              Verification Pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="p-3 border rounded-lg bg-primary/10 mb-4">
          <h4 className="font-medium mb-2">Loan Summary</h4>
          <div className="space-y-1 mb-4">
            <div className="flex justify-between">
              <span className="text-sm">Loan Type:</span>
              <span className="text-sm font-medium">{applicationData.recommendedLoan.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Amount:</span>
              <span className="text-sm font-medium">{formatCurrency(applicationData.recommendedLoan.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Interest Rate:</span>
              <span className="text-sm font-medium">{applicationData.recommendedLoan.interestRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Term:</span>
              <span className="text-sm font-medium">{applicationData.recommendedLoan.term} months</span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-1">
              <span className="text-sm">Qualification Score:</span>
              <span className={`text-sm font-medium ${
                applicationData.qualificationScore > 70 
                  ? "text-green-600 dark:text-green-400" 
                  : applicationData.qualificationScore > 40 
                  ? "text-amber-600 dark:text-amber-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>{applicationData.qualificationScore}/100</span>
            </div>
            {applicationData.recommendedLoan.fees && (
              <div className="mt-3 pt-3 border-t text-sm">
                <h5 className="font-medium mb-1">Fee Breakdown</h5>
                <div className="space-y-1">
                  {Object.entries(applicationData.recommendedLoan.fees).map(([fee, amount]) => (
                    <div key={fee} className="flex justify-between">
                      <span className="capitalize">{fee.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span>{typeof amount === 'number' ? formatCurrency(amount) : amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Required documents section */}
        <div className="bg-muted/50 p-3 rounded-md mt-4">
          <h4 className="font-medium mb-2">Required Documents</h4>
          <ul className="text-sm space-y-1">
            <li className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
              Proof of income (pay stubs, tax returns)
            </li>
            <li className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
              Government-issued ID
            </li>
            <li className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
              Bank statements (last 3 months)
            </li>
            <li className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
              Authorization for credit check
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 py-3 border-t bg-muted/30">
        <Button variant="secondary" onClick={() => window.print()}>
          Print Application
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Submit Application"}
        </Button>
      </CardFooter>
    </Card>
  );
}