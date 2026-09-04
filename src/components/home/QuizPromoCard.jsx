import React from 'react';
import { Link } from 'react-router-dom';

export function QuizPromoCard() {
  return (
    <section className="w-full lg:w-[60%] lg:max-w-[60%] mx-auto mb-10">
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30 text-white">
              🎯 Ôn luyện thực chiến
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight m-0 text-white">
              Ngân Hàng Câu Hỏi Trắc Nghiệm Có Chấm Điểm
            </h3>
            <p className="text-sm text-indigo-100 max-w-xl m-0 leading-relaxed">
              Luyện tập với 121+ câu hỏi trắc nghiệm OCP Java SE 25, kiểm tra đúng/sai tức thì và giải thích chi tiết từng câu hỏi.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 font-extrabold text-sm hover:bg-indigo-50 hover:shadow-lg transition-all no-underline"
            >
              <span>Làm Quiz Ngay</span>
              <span>➔</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
