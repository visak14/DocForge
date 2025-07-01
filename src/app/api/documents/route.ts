import { NextResponse } from 'next/server';

import { getSession } from '../../../../lib/getSession';
import { prisma } from '../../../../lib/prisma';




export async function GET() {
  const session = await getSession();

  if (!session?.user?.email) return NextResponse.json([], { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  const docs = await prisma.document.findMany({
    where: {
      OR: [
        { authorId: user?.id },
        { sharedWith: { some: { userId: user?.id } } },
        { visibility: 'PUBLIC' },
      ],
    },
    include: {
      author: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const session = await getSession();
  
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, content } = await req.json();

  const doc = await prisma.document.create({
    data: {
      title,
      content,
      authorId: session.user.id,  
    },
  });

  return NextResponse.json(doc);
}
