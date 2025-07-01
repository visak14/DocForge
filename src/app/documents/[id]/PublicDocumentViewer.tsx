// app/documents/[id]/PublicDocumentViewer.tsx
'use client';

import { useState } from 'react';
import { FileText, Globe, Lock, Users, Calendar, User } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  content: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SHARED';
  author: {
    id: string;
    email: string;
  };
  updatedAt: string;
  createdAt: string;
}

interface PublicDocumentViewerProps {
  document: Document;
  canEdit: boolean;
}

export default function PublicDocumentViewer({ 
  document, 
  canEdit 
}: PublicDocumentViewerProps) {
  const [zoom, setZoom] = useState(1);

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return <Globe className="w-4 h-4 text-green-600" />;
      case 'SHARED':
        return <Users className="w-4 h-4 text-blue-600" />;
      default:
        return <Lock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return 'Public';
      case 'SHARED':
        return 'Shared';
      default:
        return 'Private';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600 w-6 h-6" />
            <h1 className="text-xl font-semibold text-gray-900">
              {document.title}
            </h1>
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
              {getVisibilityIcon(document.visibility)}
              <span className="text-xs font-medium text-gray-600">
                {getVisibilityText(document.visibility)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {canEdit && (
              <a
                href={`/documents/${document.id}/edit`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                Edit
              </a>
            )}
            <select 
              value={Math.round(zoom * 100)} 
              onChange={(e) => setZoom(Number(e.target.value) / 100)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="75">75%</option>
              <option value="100">100%</option>
              <option value="125">125%</option>
              <option value="150">150%</option>
              <option value="200">200%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Info */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Created by {document.author.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Last updated {formatDate(document.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 min-h-[calc(100vh-300px)]"
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: 'top center',
              marginBottom: zoom > 1 ? `${(zoom - 1) * 100}vh` : '0'
            }}
          >
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: document.content }}
            />
            
            {!document.content.trim() && (
              <div className="text-gray-500 italic text-center py-12">
                This document is empty.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            Document shared via link • Created {formatDate(document.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}