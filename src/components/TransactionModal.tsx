'use client';

interface TransactionModalProps {
  isOpen: boolean;
  status: string;
  txHash?: string;
  chainId?: number;
  onClose: () => void;
}

export function TransactionModal({ isOpen, status, txHash, chainId = 97, onClose }: TransactionModalProps) {
  if (!isOpen) return null;

  const isError = status.includes('Error');
  const isSuccess = status.includes('successful') || status.includes('updated');
  const isLoading = !isError && !isSuccess;

  // Get block explorer URL
  const getExplorerUrl = () => {
    if (!txHash) return '';
    const baseUrl = chainId === 56
      ? 'https://bscscan.com'
      : 'https://testnet.bscscan.com';
    return `${baseUrl}/tx/${txHash}`;
  };

  const explorerUrl = getExplorerUrl();

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-96 border border-gray-200">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {isLoading && (
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          )}
          {isSuccess && (
            <div className="rounded-full bg-green-100 p-3">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {isError && (
            <div className="rounded-full bg-red-100 p-3">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Status Text */}
        <div className="text-center mb-6">
          <h3 className={`text-lg font-semibold mb-2 ${
            isError ? 'text-red-600' : isSuccess ? 'text-green-600' : 'text-gray-900'
          }`}>
            {isError ? 'Transaction Failed' : isSuccess ? 'Success!' : 'Processing Transaction'}
          </h3>
          <p className="text-gray-600 text-sm">{status}</p>
        </div>

        {/* Progress Steps */}
        {isLoading && (
          <div className="space-y-2 mb-6">
            {/* Only show approval step if status mentions approving */}
            {(status.includes('Approving') || status.includes('Checking') || status.includes('approval')) && (
              <div className="flex items-center text-sm">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  status.includes('Approving') && !status.includes('already') ? 'bg-blue-600 animate-pulse' :
                  status.includes('already') ? 'bg-green-600' : 'bg-blue-600 animate-pulse'
                }`}></div>
                <span className={
                  status.includes('Approving') || status.includes('Checking') ? 'text-gray-900 font-medium' : 'text-gray-500'
                }>
                  {status.includes('already') ? '✓ Token approved' : 'Checking/Approving tokens'}
                </span>
              </div>
            )}
            <div className="flex items-center text-sm">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                status.includes('Minting') || status.includes('Burning') ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'
              }`}></div>
              <span className={status.includes('Minting') || status.includes('Burning') ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                {status.includes('Burning') ? 'Burning shares' : 'Minting shares'}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                status.includes('confirmation') ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'
              }`}></div>
              <span className={status.includes('confirmation') ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                Confirming on blockchain
              </span>
            </div>
          </div>
        )}

        {/* Transaction Hash - Only display, not clickable */}
        {txHash && !isLoading && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
            <p className="text-xs font-mono text-gray-700 truncate">{txHash}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* View Transaction Button - Primary action when tx exists */}
          {txHash && explorerUrl && !isLoading && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                isSuccess
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : isError
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <span>View on BSCScan</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          {/* Close Button - Always show when not loading */}
          {!isLoading && (
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                isSuccess
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : isError
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              Close
            </button>
          )}
        </div>

        {/* Loading hint */}
        {isLoading && (
          <p className="text-center text-xs text-gray-500 mt-4">
            Please confirm the transaction in your wallet
          </p>
        )}
      </div>
    </div>
  );
}
