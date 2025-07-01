
import { redirect } from 'next/navigation';
import { getSession } from '../../../../../lib/getSession';
import { prisma } from "../../../../../lib/prisma";


export async function POST() {
  const session = await getSession();
  if (!session?.user) redirect('/signin');

  const doc = await prisma.document.create({
    data: {
      title: 'Untitled Document',
      content: '',
      authorId: session.user.id,
    },
  });

  redirect(`/documents/${doc.id}/edit`);
}
