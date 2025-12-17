// src/components/loan-recommendation.tsx
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { AlertTriangle } from './icons';
import { motion } from 'framer-motion';
import { cn } from '@/libs/utils';

interface LoanOption {
  type: string;
  amount: number;
  interestRate: number;
  term: number;
  apyEquivalent?: number;
  fees?: Record<string, number>;
}

interface LoanRecommendationResult {
  qualificationScore: number;
  recommendedLoan: LoanOption;
  alternativeOptions: LoanOption[];
  estimatedProcessingTime?: string;
  blockchainVerified?: boolean;
}

interface LoanRecommendationProps {
  isLoading?: boolean;
  result?: LoanRecommendationResult;
  applicationId?: string;
  onUpdate?: (newScore: number) => void;
  className?: string;
}

export function LoanRecommendation({ 
  isLoading = false, 
  result, 
  applicationId,
  onUpdate,
  className 
}: LoanRecommendationProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [selectedOption, setSelectedOption] = useState<LoanOption | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleApply = async () => {
    if (!applicationId || !result) return;
    
    const loanToApply = selectedOption || result.recommendedLoan;
    
    setIsApplying(true);
    try {
      // Call API to process loan application
      const response = await fetch('/api/loan-application/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          loanType: loanToApply.type,
          amount: loanToApply.amount,
          interestRate: loanToApply.interestRate,
          term: loanToApply.term
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process application');
      }
      
      const data = await response.json();
      toast.success('Loan application submitted successfully!');
      
      // Notify parent component about any updates
      if (onUpdate && data.newQualificationScore) {
        onUpdate(data.newQualificationScore);
      }
      
      setIsApplying(false);
    } catch (error) {
      console.error('Error applying for loan:', error);
      toast.error(error instanceof Error ? error.message : 'Application failed');
      setIsApplying(false);
    }
  };

  // Format currency with commas
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate monthly payment (simplified)
  const calculateMonthlyPayment = (loan: LoanOption): number => {
    const monthlyRate = loan.interestRate / 100 / 12;
    const totalPayments = loan.term;
    return (loan.amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments));
  };

  if (isLoading) {
    return (
      <div className={cn("w-full p-4 bg-muted/30 rounded-lg border border-border/50", className)}>
        <h3 className="text-base font-medium mb-2">Analyzing Loan Qualification</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Calculating your eligibility for financial assistance...
        </p>
        <div className="h-2 bg-muted mt-2 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary" 
            initial={{ width: "5%" }}
            animate={{ width: "85%" }}
            transition={{ 
              duration: 2.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { qualificationScore, recommendedLoan, alternativeOptions } = result;
  const scoreColor = qualificationScore > 70 
    ? "text-green-600 dark:text-green-400" 
    : qualificationScore > 40 
    ? "text-amber-600 dark:text-amber-400" 
    : "text-red-600 dark:text-red-400";

  return (
    <div className={cn("w-full p-4 border rounded-lg", className)}>
      <h3 className="text-base font-medium mb-2">Loan Qualification Results</h3>
      <p className="text-sm text-muted-foreground mb-3">Based on your financial profile and credit history</p>
      
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Qualification Score</span>
        <span className={`text-sm font-bold ${scoreColor}`}>{qualificationScore}/100</span>
      </div>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div 
          className={`h-full ${
            qualificationScore > 70 
              ? "bg-green-500" 
              : qualificationScore > 40 
              ? "bg-amber-500" 
              : "bg-red-500"
          }`}
          style={{ width: `${qualificationScore}%` }}
        />
      </div>
      
      {!selectedOption && recommendedLoan && (
        <motion.div 
          className="p-3 border rounded-lg bg-primary/10 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="font-medium mb-2">Recommended Option</h4>
          <div className="space-y-1 mb-4">
            <div className="flex justify-between">
              <span className="text-sm">Loan Type:</span>
              <span className="text-sm font-medium">{recommendedLoan.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Amount:</span>
              <span className="text-sm font-medium">{formatCurrency(recommendedLoan.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Interest Rate:</span>
              <span className="text-sm font-medium">{recommendedLoan.interestRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Term:</span>
              <span className="text-sm font-medium">{recommendedLoan.term} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Est. Monthly Payment:</span>
              <span className="text-sm font-medium">
                {formatCurrency(calculateMonthlyPayment(recommendedLoan))}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleApply} 
              disabled={isApplying} 
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isApplying ? 'Processing...' : 'Apply Now'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="py-2 px-3"
            >
              {showDetails ? 'Hide Details' : 'More Details'}
            </Button>
          </div>

          {showDetails && recommendedLoan.fees && (
            <div className="mt-3 pt-3 border-t text-sm">
              <h5 className="font-medium mb-1">Fee Breakdown</h5>
              <div className="space-y-1">
                {Object.entries(recommendedLoan.fees).map(([fee, amount]) => (
                  <div key={fee} className="flex justify-between">
                    <span className="capitalize">{fee.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.blockchainVerified === false && (
            <div className="mt-3 p-2 bg-amber-100 dark:bg-amber-900/30 rounded flex items-center gap-2 text-sm">
              <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
              <span>Blockchain verification pending</span>
            </div>
          )}
        </motion.div>
      )}
      
      {alternativeOptions && alternativeOptions.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Alternative Options</h4>
          <div className="space-y-2">
            {alternativeOptions.map((option, index) => {
              const isSelected = selectedOption?.type === option.type && 
                                selectedOption?.amount === option.amount;
              
              return (
                <div 
                  key={index} 
                  className={`p-3 border rounded-lg transition-colors cursor-pointer ${
                    isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedOption(isSelected ? null : option)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{option.type}</span>
                    <span className="text-sm">
                      {formatCurrency(option.amount)} at {option.interestRate}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{option.term} months</span>
                    <span>~{formatCurrency(calculateMonthlyPayment(option))}/mo</span>
                  </div>
                  
                  {isSelected && (
                    <div className="mt-3 pt-2 border-t">
                      <Button 
                        onClick={handleApply} 
                        disabled={isApplying} 
                        className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isApplying ? 'Processing...' : 'Apply for This Option'}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result.estimatedProcessingTime && (
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Estimated processing time: {result.estimatedProcessingTime}</p>
        </div>
      )}
    </div>
  );
}