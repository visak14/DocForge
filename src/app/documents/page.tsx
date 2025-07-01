import Link from 'next/link';
import { getSession } from '../../../lib/getSession';
import { redirect } from 'next/navigation';
import { prisma } from '../../../lib/prisma';
import Navbar from '../Navbar';

export default async function DocumentsPage() {
  const session = await getSession();
  if (!session?.user) redirect('/signin');

  const documents = await prisma.document.findMany({
    where: {
      OR: [
        { authorId: session.user.id  },
        { sharedWith: { some: { userId: session.user.id } } },
        { visibility: 'PUBLIC' }
      ],
    },
    include: { author: true },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-12 xl:px-24 py-6">
        {/* Start a new document */}
        <div>
          <h2 className="text-lg font-medium text-gray-700 mb-2">Start a new document</h2>
          <div className="flex items-start gap-4 overflow-x-auto pb-2">
            <form action="/api/documents/create" method="POST">
              <button
                type="submit"
                className="min-w-[10rem] w-40 h-52 flex-shrink-0 flex flex-col items-center justify-center border rounded hover:shadow bg-white"
              >
                <div className="text-6xl text-blue-500">+</div>
                <div className="mt-2 font-medium text-sm">Blank document</div>
              </button>
            </form>

            {[ 
              { name: 'Resume', subtitle: 'Serif' },
              { name: 'Letter', subtitle: 'Spearmint' },
              { name: 'Project Proposal', subtitle: 'Tropic' },
              { name: 'Report', subtitle: 'Luxe' },
            ].map((template, i) => (
              <div
                key={i}
                className="min-w-[10rem] w-40 h-52 flex-shrink-0 border rounded bg-white hover:shadow flex flex-col justify-between p-2"
              >
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="text-sm font-medium mt-2">{template.name}</div>
                <div className="text-xs text-gray-500">{template.subtitle}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent documents */}
        <div className="mt-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
            <h2 className="text-lg font-medium text-gray-700">Recent documents</h2>
            <div className="text-sm text-gray-500">Owned by anyone ▼</div>
          </div>

          {documents.length === 0 ? (
            <p className="text-sm text-gray-500">No documents found. Click “New Document” to create one.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {documents.map((doc) => (
                <Link key={doc.id} href={`/documents/${doc.id}/edit`}>
                  <div className="border hover:shadow rounded bg-white cursor-pointer flex flex-col h-52">
                    <div className="flex-1 bg-gray-100 rounded-t px-2 py-1 overflow-hidden"></div>
                    <div className="px-3 py-2 border-t text-sm">
                      <div className="font-medium truncate">
                        {doc.title || 'Untitled Document'}
                      </div>
                      <div className="text-xs text-gray-500">
                        By {doc.author.email.split('@')[0]} •{' '}
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
