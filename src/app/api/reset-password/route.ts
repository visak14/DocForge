
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '../../../../lib/prisma';


export async function POST(req: Request) {
  const { token, password } = await req.json();

  const tokenRecord = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Token invalid or expired' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email: tokenRecord.email },
    data: { password: hashed },
  });

  await prisma.passwordResetToken.delete({ where: { token } });

  return NextResponse.json({ message: 'Password updated' });
}
