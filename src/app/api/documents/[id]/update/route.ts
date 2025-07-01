
import { NextResponse } from 'next/server';
import { getSession } from "../../../../../../lib/getSession";
import { prisma } from "../../../../../../lib/prisma";



export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  
  const updated = await prisma.document.update({
    where: { id },
    data: { content: body.content },
  });

  return NextResponse.json(updated);
}