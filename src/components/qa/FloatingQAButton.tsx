'use client';

import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

export default function FloatingQAButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push('/qa')}
            className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group"
            aria-label="Open Q&A"
        >
            <MessageCircle className="w-8 h-8 text-white" />
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                !
            </span>
        </button>
    );
}
