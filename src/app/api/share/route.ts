import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '../../../../lib/prisma';



export async function POST(req: NextRequest) {
  const { documentId, email, canEdit } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await prisma.sharedAccess.upsert({
    where: {
      documentId_userId: {
        documentId,
        userId: user.id,
      },
    },
    update: { canEdit },
    create: {
      documentId,
      userId: user.id,
      canEdit,
    },
  });

  return NextResponse.json({ success: true });
}
