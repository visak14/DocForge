// app/documents/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getSession } from '../../../../lib/getSession';
import { prisma } from '../../../../lib/prisma';
import PublicDocumentViewer from './PublicDocumentViewer';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = params;
  const session = await getSession();

  // Fetch the document
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          email: true
        }
      }
    }
  });

  if (!document) {
    notFound();
  }

  // Check access permissions
  const user = session?.user?.email 
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null;

  const isAuthor = document.authorId === user?.id;
  const isPublic = document.visibility === 'PUBLIC';
  
  // Check if user has shared access
  const hasSharedAccess = user ? await prisma.sharedAccess.findFirst({
    where: { 
      documentId: document.id, 
      userId: user.id 
    }
  }) : null;

  const hasAccess = isAuthor || isPublic || hasSharedAccess;

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to view this document.
          </p>
          <a 
            href="/documents" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go to your documents
          </a>
        </div>
      </div>
    );
  }

  // If user is the author, redirect to edit page
  if (isAuthor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting to edit mode...</p>
          <script dangerouslySetInnerHTML={{
            __html: `window.location.href = '/documents/${id}/edit';`
          }} />
        </div>
      </div>
    );
  }

  return (
    <PublicDocumentViewer 
      document={{
        id: document.id,
        title: document.title,
        content: document.content,
        visibility: document.visibility,
        author: document.author,
        updatedAt: document.updatedAt.toISOString(),
        createdAt: document.createdAt.toISOString()
      }}
      canEdit={Boolean(hasSharedAccess?.canEdit)}
    />
  );
}