// api/documents/[id]/route.ts - Improved version
import { NextRequest, NextResponse } from 'next/server';

import { getSession } from '../../../../../lib/getSession';
import { prisma } from '../../../../../lib/prisma';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  
  const doc = await prisma.document.findUnique({
    where: { id },
    include: { author: true },
  });

  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const user = session?.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null;

  const hasAccess =
    doc.visibility === 'PUBLIC' ||
    doc.authorId === user?.id ||
    (await prisma.sharedAccess.findFirst({
      where: { documentId: doc.id, userId: user?.id },
    }));

  if (!hasAccess) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  return NextResponse.json(doc);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content } = body;

    // Validate that at least one field is being updated
    if (title === undefined && content === undefined) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const doc = await prisma.document.findUnique({ 
      where: { id } 
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (doc.authorId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Prepare update data - only update fields that are provided
    const updateData: { title?: string; content?: string; updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (title !== undefined) {
      updateData.title = title;
    }

    if (content !== undefined) {
      updateData.content = content;
    }

    const updated = await prisma.document.update({
      where: { id },
      data: updateData,
      include: { author: true }, // Include author for consistency with GET
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    const { id } = await params;
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const doc = await prisma.document.findUnique({ 
      where: { id } 
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (doc.authorId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete related records first (if any)
    await prisma.sharedAccess.deleteMany({
      where: { documentId: id },
    });

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}