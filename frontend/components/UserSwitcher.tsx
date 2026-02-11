'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/chat';

interface UserSwitcherProps {
  currentUser: User | null;
  onUserChange: (user: User) => void;
}

export default function UserSwitcher({ currentUser, onUserChange }: UserSwitcherProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/api/users')
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  const currentName = currentUser?.name?.split(' ')[0] || 'User';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-indigo-700 hover:bg-gray-50"
      >
        <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-semibold">
          {currentName.charAt(0).toUpperCase()}
        </div>
        <span className="truncate max-w-[90px]">{currentName}</span>
        <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            {users.map((user) => {
              const name = user.name.split(' ')[0];
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    onUserChange(user);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-semibold">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{name}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}