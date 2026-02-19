"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-gray-700 mb-6 pb-4 flex justify-between items-center flex-shrink-0 min-h-[3.5rem]">
      <h1 className="text-2xl font-bold text-gray-100 truncate min-w-0">MissionManagerWeb</h1>
      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
        {status === "loading" && (
          <span className="text-sm text-gray-500">読込中...</span>
        )}
        {status === "authenticated" && session?.user && (
          <>
            <span className="text-sm text-gray-400 truncate max-w-[200px]" title={session.user.email ?? undefined}>
              {session.user.email}
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-700 text-gray-200"
            >
              ログアウト
            </button>
          </>
        )}
      </div>
    </header>
  );
}
