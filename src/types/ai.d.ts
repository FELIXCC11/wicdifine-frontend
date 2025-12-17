import { Message } from 'ai';

export interface Attachment {
  name: string;
  type: string;
  url: string;
  size?: number;
}


export interface LoanOption {
  type: string;
  amount: number;
  interestRate: number;
  term: number;
  fees?: {
    originationFee?: number;
    processingFee?: number;
    closingCosts?: number;
    [key: string]: number | undefined;
  };
}

export interface LoanApplicationData {
  recommendedLoan: LoanOption;
  qualificationScore: number;
  alternativeOptions?: LoanOption[];
  estimatedProcessingTime?: string;
  blockchainVerified?: boolean;
  wicchain_id?: string;
}

export interface UIMessage extends Message {
  parts: any[];
  createdAt?: string | Date;
  experimental_attachments?: Array<Attachment>;
  loan_application?: LoanApplicationData; 
}