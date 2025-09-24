'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home,
    Search,
    Box,
    FileText,
    Bell,
    HelpCircle,
    Settings,
    MoreVertical,
} from 'lucide-react';
import Image from 'next/image';
import { useUser, useUserState } from '@/contexts/UserContext';

const navigation = [
    { name: 'Главная', href: '/dashboard', icon: Home },
    { name: 'Предметы', href: '/subjects', icon: Box },
    { name: 'Дневник', href: '/diary', icon: FileText },
];

const utilityItems = [
    { name: 'Уведомления', href: '/notifications', icon: Bell, badge: 12 },
    { name: 'Поддержка', href: '/support', icon: HelpCircle },
    { name: 'Настройки', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const { user } = useUserState();

    const handleProfileClick = () => {
        router.push('/profile');
        setSidebarOpen(false);
    };

    return (
        <>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
                </div>
            )}

            <div
                className={`h-screen fixed inset-y-0 top-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-full flex-col bg-white">
                    <div className="p-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <Image src="/Logo.png" alt="logo" width={48} height={48} />
                            <span className="text-xl font-bold text-gray-900">
                                Astar
                            </span>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Поиск"
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                            />
                        </div>
                    </div>

                    <nav className="flex-1 px-6">
                        <div className="space-y-2">
                            {navigation.map(item => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            isActive
                                                ? 'bg-purple-100 text-purple-600'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <item.icon
                                            className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                                isActive
                                                    ? 'text-purple-600'
                                                    : 'text-gray-500'
                                            }`}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-2">
                            {utilityItems.map(item => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            isActive
                                                ? 'bg-purple-100 text-purple-600'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <div className="flex items-center">
                                            <item.icon className="mr-3 h-5 w-5 text-gray-500" />
                                            {item.name}
                                        </div>
                                        {item.badge && (
                                            <span className="bg-purple-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    <div className="p-6">
                        <div
                            className="bg-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={handleProfileClick}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                            <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {user?.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {user?.username}
                                        </div>  
                                        <div className="text-xs text-gray-500">
                                            {user?.role}
                                        </div>  
                                    </div>
                                </div>

                                <button className="p-1 hover:bg-gray-200 rounded">
                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:hidden">
                <button
                    onClick={() => setSidebarOpen(prev => !prev)}
                    className="fixed top-4 left-4 z-50 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 bg-white shadow-lg"
                >
                    <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
            </div>
        </>
    );
}
