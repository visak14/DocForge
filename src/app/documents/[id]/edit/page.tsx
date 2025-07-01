
import { redirect } from 'next/navigation';
import { getSession } from '../../../../../lib/getSession';
import GoogleDocsEditor from '../../../../../components/GoogleDocsEditor';
import { prisma } from '../../../../../lib/prisma';



export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) redirect('/signin');

  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) redirect('/documents');

  return (
    <GoogleDocsEditor
      docId={id} 
      initialTitle={document.title || 'Untitled Document'} 
      initialContent={document.content || ''} 
    />
  );
}