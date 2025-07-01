
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";


export async function POST(req: Request) {
  const {  email, password } = await req.json();

  if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return NextResponse.json({ error: 'Email already used' }, { status: 400 });

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {  email, password: hashedPassword },
  });

  return NextResponse.json({ message: 'User created' });
}
