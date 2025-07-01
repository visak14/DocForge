import { NextResponse } from 'next/server';

import { randomBytes } from 'crypto';
import { Resend } from 'resend';
import { prisma } from '../../../../lib/prisma';


const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'Password reset link sent if email exists' });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'Your App <onboarding@resend.dev>', // Or your verified domain
      to: email,
      subject: 'Reset your password',
      html: `<p>Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });

    return NextResponse.json({ message: 'Password reset link sent if email exists' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
