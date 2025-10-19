'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'loading';

interface ToastProps {
  isOpen: boolean;
  type: ToastType;
  message: string;
  txHash?: string;
  chainId?: number;
  onClose: () => void;
  autoClose?: boolean; // Auto close after 5 seconds for success
}

export function Toast({
  isOpen,
  type,
  message,
  txHash,
  chainId = 97,
  onClose,
  autoClose = true
}: ToastProps) {
  // Auto close success toasts after 5 seconds
  useEffect(() => {
    if (isOpen && type === 'success' && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, type, autoClose, onClose]);

  if (!isOpen) return null;

  // Get block explorer URL
  const getExplorerUrl = () => {
    if (!txHash) return '';
    const baseUrl = chainId === 56
      ? 'https://bscscan.com'
      : 'https://testnet.bscscan.com';
    return `${baseUrl}/tx/${txHash}`;
  };

  const explorerUrl = getExplorerUrl();

  // Icon and colors based on type
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          icon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      case 'loading':
        return {
          bg: 'bg-blue-500',
          icon: (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          )
        };
    }
  };

  const { bg, icon } = getTypeStyles();

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-5 duration-300">
      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden min-w-[320px] max-w-md">
        {/* Colored top bar */}
        <div className={`h-1 ${bg}`}></div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`${bg} rounded-full p-1.5 flex-shrink-0 mt-0.5`}>
              {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium mb-1">
                {type === 'success' && '✅ Transaction Successful'}
                {type === 'error' && '❌ Transaction Failed'}
                {type === 'loading' && '⏳ Transaction Pending'}
              </p>
              <p className="text-gray-300 text-xs break-words">
                {message}
              </p>

              {/* Transaction hash - clickable link (only show after transaction is confirmed) */}
              {txHash && explorerUrl && type !== 'loading' && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                >
                  <span>View on BSCScan</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            {/* Close button - only show for error or success */}
            {type !== 'loading' && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300 transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
