// api/documents/[id]/visibility/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../../../../lib/getSession';
import { prisma } from '../../../../../../lib/prisma';

export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { visibility } = await req.json();

  // Validate visibility value
  if (!['PRIVATE', 'PUBLIC', 'SHARED'].includes(visibility)) {
    return NextResponse.json(
      { error: 'Invalid visibility value' }, 
      { status: 400 }
    );
  }

  try {
    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the document exists and user is the author
    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.authorId !== user.id) {
      return NextResponse.json(
        { error: 'Only the document author can change visibility' }, 
        { status: 403 }
      );
    }

    // Update the document visibility
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: { 
        visibility: visibility as 'PRIVATE' | 'PUBLIC' | 'SHARED',
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      document: updatedDocument
    });

  } catch (error) {
    console.error('Error updating document visibility:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}