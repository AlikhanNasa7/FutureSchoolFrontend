'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Box, BookOpen, FileText, User } from 'lucide-react';
import { useUserState } from '@/contexts/UserContext';

const mobileNavigation = [
    {
        name: 'Главная',
        href: '/dashboard',
        icon: Home,
        roles: ['teacher', 'student', 'superadmin', 'schooladmin'],
    },
    {
        name: 'Предметы',
        href: '/subjects',
        icon: Box,
        roles: ['teacher', 'student'],
    },
    {
        name: 'Задания',
        href: '/assignments',
        icon: BookOpen,
        roles: ['teacher', 'student'],
    },
    {
        name: 'Дневник',
        href: '/diary',
        icon: FileText,
        roles: ['teacher', 'student'],
    },
];

export default function MobileBottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useUserState();

    const handleProfileClick = () => {
        router.push('/profile');
    };

    const filteredNavigation = mobileNavigation.filter(
        item => user?.role && item.roles.includes(user.role as string)
    );

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 max-[575px]:block hidden">
            <div className="flex items-center justify-around h-16 px-2">
                {/* Profile Button - Leftmost */}
                <button
                    onClick={handleProfileClick}
                    className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="text-xs text-gray-600 mt-1">Профиль</span>
                </button>

                {/* Navigation Items */}
                {filteredNavigation.map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <item.icon
                                className={`w-6 h-6 ${
                                    isActive
                                        ? 'text-purple-600'
                                        : 'text-gray-500'
                                }`}
                            />
                            <span
                                className={`text-xs mt-1 ${
                                    isActive
                                        ? 'text-purple-600 font-medium'
                                        : 'text-gray-600'
                                }`}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
