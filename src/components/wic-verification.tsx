// Updated wic-verification.tsx component with larger images and less text
import React, { useState } from 'react';
import { AlertTriangle, FileText, ChevronDownIcon } from './icons';
import { cn } from '@/libs/utils';
import { Button } from './ui/button';
import Image from 'next/image';

interface WicVerificationProps {
  isLoading?: boolean;
  result?: {
    verified: boolean;
    lastChecked: string;
    details?: Record<string, string | number | boolean>;
    blockchain?: {
      txHash: string;
      blockNumber: string | number;
    }
  };
  applicationId?: string;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Simple WIC Verification badge for chat input - with larger icon
export function WicVerificationBadge({ 
  result,
  className,
  onClick,
}: { 
  result?: WicVerificationProps['result'],
  className?: string,
  onClick?: () => void 
}) {
  return (
    <div 
      className={cn("bg-transparent hover:bg-zinc-900 transition-colors rounded-md cursor-pointer", className)}
      onClick={onClick}
    >
      <div className="flex items-center justify-center">
        <Image 
          src="/Wichain.png" 
          alt="WICchain" 
          width={28} 
          height={28} 
          className="opacity-85 hover:opacity-100"
        />
      </div>
    </div>
  );
}

export function WicVerification({ 
  isLoading = false, 
  result, 
  applicationId,
  className,
  isCollapsed = false,
  onToggleCollapse
}: WicVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleVerify = async () => {
    if (!applicationId) return;
    
    setIsVerifying(true);
    try {
      // Call API to initiate blockchain verification
      const response = await fetch('/api/wic-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId }),
      });
      
      if (!response.ok) throw new Error('Verification failed');
      setIsVerifying(false);
    } catch (error) {
      console.error('Error during verification:', error);
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("w-full p-3 bg-black rounded-md border border-zinc-800", className)}>
        <div className="flex items-center gap-2 mb-2">
          <Image src="/Wichain.png" alt="WICchain" width={24} height={24} />
          <h3 className="text-sm font-medium">Verification</h3>
        </div>
        <p className="text-xs text-zinc-400 mb-2">
          Checking blockchain verification status...
        </p>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary" 
            style={{ 
              width: '45%', 
              transition: 'width 0.5s ease-in-out',
              animation: 'progress 1.5s infinite ease-in-out' 
            }}
          ></div>
        </div>
        <style jsx>{`
          @keyframes progress {
            0% { width: 5%; }
            50% { width: 45%; }
            100% { width: 85%; }
          }
        `}</style>
      </div>
    );
  }

  if (!result) return null;

  // Mini collapsed version for input area
  if (isCollapsed) {
    return (
      <div className={cn("flex items-center gap-1 py-1.5 px-2 bg-black rounded-md border border-zinc-800", className)}>
        <Image src="/Wichain.png" alt="WICchain" width={22} height={22} />
        {result.verified ? (
          <span className="px-1.5 py-0.5 text-[10px] rounded-full font-medium bg-green-900/50 text-green-400 border border-green-800">
            Verified
          </span>
        ) : null}
        <span className="text-[10px] text-zinc-500 ml-1">{result.lastChecked}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5 p-0 ml-auto hover:bg-zinc-800"
          onClick={onToggleCollapse}
        >
          <div className="text-zinc-400">
            <ChevronDownIcon size={12} />
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("w-full p-3 bg-black rounded-md border border-zinc-800", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Image src="/Wichain.png" alt="WICchain" width={26} height={26} />
          <h3 className="text-sm font-medium">Verification Status</h3>
        </div>
        
        {result.verified ? (
          <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-green-900/50 text-green-400 border border-green-800 flex items-center gap-1">
            Verified
          </span>
        ) : (
          <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-red-900/50 text-red-400 border border-red-800 flex items-center gap-1">
            <AlertTriangle size={10} />
            Not Verified
          </span>
        )}
      </div>
      
      <div className="text-xs text-zinc-400 mb-3 flex justify-between">
        <span>Blockchain verification results</span>
        <span>Last checked: {result.lastChecked}</span>
      </div>
      
      {expanded && result.details && (
        <div className="space-y-1 text-xs mb-3 bg-zinc-800/50 p-2 rounded-md">
          {Object.entries(result.details).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="capitalize text-zinc-400">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
              <span className="font-medium">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex gap-2">
        <Button 
          onClick={handleVerify} 
          disabled={isVerifying} 
          size="sm"
          className={cn(
            "flex-1 py-1 text-xs rounded-md",
            result.verified 
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200" 
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          )}
        >
          {isVerifying ? 'Verifying...' : (result.verified ? 'Refresh' : 'Verify Now')}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="size-7 p-0 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
          onClick={() => setExpanded(!expanded)}
        >
          <FileText size={14} />
          <span className="sr-only">{expanded ? 'Hide details' : 'Show details'}</span>
        </Button>
        
        {onToggleCollapse && (
          <Button
            variant="outline"
            size="icon"
            className="size-7 p-0 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
            onClick={onToggleCollapse}
          >
            <div className="rotate-180">
              <ChevronDownIcon size={14} />
            </div>
            <span className="sr-only">Collapse</span>
          </Button>
        )}
      </div>
      
      {expanded && result.blockchain && (
        <div className="mt-3 p-2 bg-zinc-800/50 rounded-md text-[10px] font-mono overflow-x-auto text-zinc-400">
          <div>Transaction: {result.blockchain.txHash}</div>
          <div>Block: {result.blockchain.blockNumber}</div>
        </div>
      )}
    </div>
  );
}