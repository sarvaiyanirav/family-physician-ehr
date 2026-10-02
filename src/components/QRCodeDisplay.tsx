import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Smartphone, Download, Copy, Check, ExternalLink } from 'lucide-react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
  sublabel?: string;
  showActions?: boolean;
  className?: string;
  onPreviewMobile?: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 130,
  label = 'Scan for Mobile Instructions',
  sublabel = 'View your care plan, prescriptions & follow-up on your phone',
  showActions = true,
  className = '',
  onPreviewMobile,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    QRCode.toDataURL(
      value,
      {
        width: size * 2, // 2x resolution for high-DPI screens and crisp printing
        margin: 1,
        color: {
          dark: '#1e293b', // slate-800 for high-contrast scanning
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (err, url) => {
        if (!isMounted) return;
        if (err) {
          console.error('Failed to generate QR code:', err);
          setError('Could not generate QR code');
        } else {
          setDataUrl(url);
          setError(null);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'patient-visit-instructions-qr.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-3 shadow-xs flex flex-col sm:flex-row items-center gap-3.5 ${className}`}
    >
      {/* The QR Code Container */}
      <div className="relative shrink-0 bg-white p-1.5 rounded-md border border-gray-100 flex items-center justify-center">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="Mobile Care Plan QR Code"
            width={size}
            height={size}
            className="rounded"
            style={{ width: `${size}px`, height: `${size}px` }}
          />
        ) : error ? (
          <div
            style={{ width: `${size}px`, height: `${size}px` }}
            className="flex items-center justify-center text-[10px] text-rose-600 bg-rose-50 rounded text-center p-2"
          >
            {error}
          </div>
        ) : (
          <div
            style={{ width: `${size}px`, height: `${size}px` }}
            className="flex items-center justify-center bg-gray-50 animate-pulse rounded text-gray-400 text-xs"
          >
            Generating...
          </div>
        )}

        {/* Subtle center smartphone badge overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-6 h-6 rounded-full bg-white shadow-xs border border-gray-200 flex items-center justify-center text-red-700">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Info & Instructions */}
      <div className="flex-1 text-center sm:text-left space-y-1">
        <div className="flex items-center justify-center sm:justify-start gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-red-700 shrink-0" />
          <span className="font-bold text-gray-900 text-xs uppercase tracking-wide">
            {label}
          </span>
        </div>

        <p className="text-[11px] text-gray-600 leading-snug">
          {sublabel}
        </p>

        <p className="text-[10px] text-gray-400 font-mono">
          Point your smartphone camera at this code to open your secure digital visit instructions. No app download needed.
        </p>

        {/* Action Controls (hidden in print) */}
        {showActions && (
          <div className="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-1.5 no-print">
            {onPreviewMobile && (
              <button
                type="button"
                onClick={onPreviewMobile}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors cursor-pointer"
                title="Preview smartphone layout in dialog"
              >
                <ExternalLink className="w-3 h-3 text-red-700" />
                <span>Test Mobile View</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors cursor-pointer"
              title="Copy link to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-gray-500" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors cursor-pointer"
              title="Download QR code image (PNG)"
            >
              <Download className="w-3 h-3 text-gray-500" />
              <span>Save Image</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
