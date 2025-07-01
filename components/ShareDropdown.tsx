import React, { useState, useRef, useEffect } from 'react';
import { Share, ChevronDown, Copy, Check, Globe, Lock, Users } from 'lucide-react';

interface ShareDropdownProps {
  docId: string;
  currentVisibility: 'PRIVATE' | 'PUBLIC' | 'SHARED';
  onVisibilityChange: (visibility: 'PRIVATE' | 'PUBLIC' | 'SHARED') => void;
}

export default function ShareDropdown({ 
  docId, 
  currentVisibility, 
  onVisibilityChange 
}: ShareDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shareUrl = `${window.location.origin}/documents/${docId}`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleVisibilityChange = async (newVisibility: 'PRIVATE' | 'PUBLIC' | 'SHARED') => {
    try {
      const response = await fetch(`/api/documents/${docId}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newVisibility }),
      });

      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }

      onVisibilityChange(newVisibility);
    } catch (error) {
      console.error('Error updating visibility:', error);
      alert('Failed to update document visibility');
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return <Globe className="w-4 h-4" />;
      case 'SHARED':
        return <Users className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return 'Anyone with the link';
      case 'SHARED':
        return 'Specific people';
      default:
        return 'Private';
    }
  };

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return 'Anyone on the internet with this link can view';
      case 'SHARED':
        return 'Only people with access can open with this link';
      default:
        return 'Only you can access';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
      >
        <Share className="w-4 h-4" />
        Share
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3">Share document</h3>
            
            {/* Current Visibility Display */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                {getVisibilityIcon(currentVisibility)}
                <span className="font-medium">{getVisibilityText(currentVisibility)}</span>
              </div>
              <p className="text-sm text-gray-600">
                {getVisibilityDescription(currentVisibility)}
              </p>
            </div>

            {/* Copy Link Section */}
            {currentVisibility === 'PUBLIC' && (
              <div className="mb-4">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {/* Visibility Options */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">General access</h4>
              
              <button
                onClick={() => handleVisibilityChange('PRIVATE')}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  currentVisibility === 'PRIVATE' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Private</div>
                    <div className="text-sm text-gray-500">Only you can access</div>
                  </div>
                  {currentVisibility === 'PRIVATE' && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleVisibilityChange('PUBLIC')}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  currentVisibility === 'PUBLIC' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Anyone with the link</div>
                    <div className="text-sm text-gray-500">Anyone on the internet with this link can view</div>
                  </div>
                  {currentVisibility === 'PUBLIC' && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleVisibilityChange('SHARED')}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  currentVisibility === 'SHARED' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Specific people</div>
                    <div className="text-sm text-gray-500">Only people with access can open with this link</div>
                  </div>
                  {currentVisibility === 'SHARED' && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </button>
            </div>

            {/* Done Button */}
            <div className="mt-4 pt-3 border-t">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}