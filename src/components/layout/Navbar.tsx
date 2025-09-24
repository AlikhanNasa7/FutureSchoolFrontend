'use client';

import { useState } from 'react';
import {
    Bell,
    Search,
    User,
    Settings,
    LogOut,
    ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import { modalController } from '@/lib/modalController';
import { useUserState } from '@/contexts/UserContext';

export default function Navbar() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const { user } = useUserState();

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
    };

    return (
        <nav className="flex bg-inherit p-10 gap-8 pb-0 sm:flex-row flex-col">
            <div className="flex-3/4 px-4 sm:px-6 pr-0 sm:pr-0 flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[rgba(0,0,0,0.31)]">
                        Добро пожаловать, {user?.first_name}
                    </h1>
                </div>
                <div
                    className="bg-white rounded-2xl px-4 py-2 h-[60px] cursor-pointer xs:block hidden"
                    onClick={() => modalController.open('kundelik-integration')}
                >
                    <Image
                        src="/kundelik.png"
                        alt="kundelik.kz logo"
                        width={100}
                        height={50}
                    />
                </div>
            </div>
            <div className="w-fit bg-white h-[60px] rounded-2xl flex py-2 px-4 gap-6 items-center">
                {user && user.role == 'student' && user?.student_data?.classrooms[0] && <div className="bg-[rgba(105,76,253,0.1)] px-6 py-2 rounded-xl text-[rgba(105,76,253,1)] font-bold text-md">
                    {`${user?.student_data?.classrooms[0].grade}${user?.student_data?.classrooms[0].letter}`} класс
                </div>}
                <div className="font-bold text-md">Школа 14</div>
            </div>
            <div
                className="bg-white w-fit rounded-2xl px-4 py-2 h-[60px] cursor-pointer xs:hidden block"
                onClick={() => modalController.open('kundelik-integration')}
            >
                <Image
                    src="/kundelik.png"
                    alt="kundelik.kz logo"
                    width={100}
                    height={50}
                />
            </div>
        </nav>
    );
}
