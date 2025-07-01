// api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../../lib/getSession';
import { prisma } from '../../../../lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';

  try {
    // Get current user to exclude from results
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Search for users excluding the current user
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUser.id } }, // Exclude current user
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              // Add name field search if you have a name field
              // { name: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        email: true,
        // name: true, // Include if you have a name field
      },
      take: 10, // Limit results
      orderBy: {
        email: 'asc'
      }
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}