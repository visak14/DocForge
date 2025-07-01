// api/documents/[id]/mentions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../../../../lib/getSession';
import { prisma } from '../../../../../../lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: documentId } = params;
  const { mentionedUserIds } = await req.json();

  if (!Array.isArray(mentionedUserIds) || mentionedUserIds.length === 0) {
    return NextResponse.json({ error: 'Invalid mentioned user IDs' }, { status: 400 });
  }

  try {
    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify document exists and user has access
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { author: true }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if user has permission to mention others (author or has edit access)
    const hasEditAccess = document.authorId === currentUser.id || 
      await prisma.sharedAccess.findFirst({
        where: { 
          documentId, 
          userId: currentUser.id, 
          canEdit: true 
        }
      });

    if (!hasEditAccess) {
      return NextResponse.json({ error: 'No permission to mention users' }, { status: 403 });
    }

    // Process mentions in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const mentions = [];
      const notifications = [];
      const sharedAccesses = [];

      for (const mentionedUserId of mentionedUserIds) {
        // Check if user exists
        const mentionedUser = await tx.user.findUnique({
          where: { id: mentionedUserId }
        });

        if (!mentionedUser) {
          continue; // Skip invalid user IDs
        }

        // Create mention record
        const mention = await tx.mention.create({
          data: {
            documentId,
            mentionedId: mentionedUserId,
          },
          include: {
            mentioned: {
              select: { id: true, email: true }
            },
            document: {
              select: { id: true, title: true }
            }
          }
        });

        mentions.push(mention);

        // Auto-grant read access if user doesn't have access
        const existingAccess = await tx.sharedAccess.findFirst({
          where: { 
            documentId, 
            userId: mentionedUserId 
          }
        });

        if (!existingAccess && document.authorId !== mentionedUserId) {
          const sharedAccess = await tx.sharedAccess.create({
            data: {
              documentId,
              userId: mentionedUserId,
              canEdit: false, // Default to read-only access
            }
          });
          sharedAccesses.push(sharedAccess);
        }

        // Create notification (you can extend this to send emails, push notifications, etc.)
        const notification = await tx.notification.create({
          data: {
            userId: mentionedUserId,
            type: 'MENTION',
            title: `You were mentioned in "${document.title}"`,
            message: `${currentUser.email} mentioned you in the document "${document.title}"`,
            documentId,
            isRead: false,
          }
        });

        notifications.push(notification);
      }

      return { mentions, notifications, sharedAccesses };
    });

    return NextResponse.json({
      success: true,
      mentions: result.mentions.length,
      autoShared: result.sharedAccesses.length,
      notifications: result.notifications.length
    });

  } catch (error) {
    console.error('Error processing mentions:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}