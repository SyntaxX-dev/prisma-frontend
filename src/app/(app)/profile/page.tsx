'use client';

import { Suspense } from 'react';
import { ProfilePage } from '@/components/features/profile';
import { LoadingGrid } from '@/components/ui/loading-grid';

function ProfileContent() {
  return <ProfilePage />;
}

export default function Profile() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center">
        <LoadingGrid size="60" color="#bd18b4" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}