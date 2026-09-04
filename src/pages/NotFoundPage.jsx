import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { EmptyState } from '../components/common/EmptyState';

export function NotFoundPage() {
  return (
    <div className="app-container min-h-screen flex flex-col">
      <Navbar />
      <main className="w-full max-w-2xl mx-auto py-16 px-4 text-center flex-1">
        <EmptyState
          icon="404"
          title="Trang không tìm thấy"
          text="Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển sang địa chỉ mới."
          action={
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs sm:text-sm hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all no-underline"
            >
              <span>← Về trang chủ</span>
            </Link>
          }
        />
      </main>
      <Footer />
    </div>
  );
}
