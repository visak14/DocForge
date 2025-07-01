'use client';

import { useSession, signOut } from 'next-auth/react';
import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();


 
// add this at top

  const userInitial = session?.user?.email?.charAt(0).toUpperCase() ?? '';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
 

  // Sign out and redirect
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.replace('/');
  };



 

  


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

 

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Left Icons */}
      <div className="flex items-center space-x-4">
        <FileText className="w-6 h-6 text-blue-600" />
        <span className="text-xl font-semibold text-gray-700">Docs</span>
      </div>

   


      {/* Avatar */}
      <div className="relative" ref={avatarRef}>
        {status === 'authenticated' && session?.user ? (
          <>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 bg-blue-500 text-white flex items-center justify-center rounded-full text-sm font-semibold"
              title={session.user.email  ?? undefined }
            >
              {userInitial}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={handleSignOut}
                >
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="w-9 h-9 bg-gray-300 rounded-full animate-pulse" />
        )}
      </div>
    </nav>
  );
}
