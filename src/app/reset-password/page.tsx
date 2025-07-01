// app/reset-password/page.tsx
import { Suspense } from 'react';
import ResetPassword from './ResetPassword';


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </main>
    }>
      <ResetPassword />
    </Suspense>
  );
}