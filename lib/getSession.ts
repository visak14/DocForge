// lib/getSession.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from './authOptions';

export const getSession = () => getServerSession(authOptions);
