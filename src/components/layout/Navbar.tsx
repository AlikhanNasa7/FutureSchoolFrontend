'use client';

import { useState } from 'react';
import {
    Bell,
    Search,
    User,
    Settings,
    LogOut,
    ChevronDown,
    Languages,
} from 'lucide-react';
import Image from 'next/image';
import { modalController } from '@/lib/modalController';
import { useUserState } from '@/contexts/UserContext';
import { useLocale, type Locale } from '@/contexts/LocaleContext';

export default function Navbar() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const { user } = useUserState();
    const { locale, setLocale, t } = useLocale();

    return (
        <nav className="flex bg-inherit p-10 gap-8 pb-0 sm:flex-row flex-col">
            <div className="hidden flex-3/4 px-4 sm:px-6 pr-0 sm:pr-0 min-[576px]:flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[rgba(0,0,0,0.31)]">
                        {t('dashboard.welcome')}, {user?.first_name}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    {/* Language Selector */}
                    <div className="relative">
                        <select
                            value={locale}
                            onChange={e => setLocale(e.target.value as Locale)}
                            className="bg-white rounded-xl px-4 py-2 h-[60px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer appearance-none pr-10 font-medium text-gray-700"
                        >
                            <option value="ru">Русский</option>
                            <option value="en">English</option>
                            <option value="kk">Қазақша</option>
                        </select>
                        <Languages className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {/* <div
                        className="bg-white rounded-2xl px-4 py-2 h-[60px] cursor-pointer xs:block hidden"
                        onClick={() =>
                            modalController.open('kundelik-integration')
                        }
                    >
                        <Image
                            src="/kundelik.png"
                            alt="kundelik.kz logo"
                            width={100}
                            height={50}
                            className="w-full"
                        />
                    </div> */}
                </div>
            </div>
            {user && user.role == 'student' && (
                <div className="hidden min-[576px]:flex w-fit bg-white h-[60px] rounded-2xl py-2 px-4 gap-6 items-center">
                    {user?.student_data?.classrooms?.[0] && (
                        <p className="bg-[rgba(105,76,253,0.1)] px-6 py-2 rounded-xl text-[rgba(105,76,253,1)] font-bold text-md whitespace-nowrap">
                            {`${user?.student_data?.classrooms[0].grade}${user?.student_data?.classrooms[0].letter}`}{' '}
                            класс
                        </p>
                    )}
                </div>
            )}
            <div className="flex min-[576px]:hidden justify-center items-center">
                <Image
                    src="/Logo.svg"
                    alt="logo"
                    width={160}
                    height={160}
                    className="w-full"
                />
            </div>
        </nav>
    );
}
