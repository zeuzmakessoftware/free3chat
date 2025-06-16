"use client";

import { CgProfile } from "react-icons/cg";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import ThemeButton from "@/components/ThemeButton";
import Link from "next/link";
import { useSession } from "next-auth/react";

const ShortcutFormat = (shortcut: string) => {
    return <span className="flex gap-2">
        {shortcut.split("+").map((key, index) => (
            <span className="bg-pink-500/20 rounded-md p-2 text-xs" key={index}>{key}</span>
        ))}
    </span>;
}

const SettingsPage = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return ( 
    <div 
        className="overflow-y-auto h-screen"
        style={{
            background: theme === 'dark'
                ? 'linear-gradient(to bottom, #1E141A, #0E040A)'
                : 'linear-gradient(to bottom, white, #fecdd3)'
        }}
    >
        <div className="flex justify-between gap-2 w-full px-24 py-6">
            <Link href="/" className="flex gap-2 items-center hover:bg-pink-500/20 cursor-pointer rounded-md py-2 px-4 transition-all duration-300">
                <ArrowLeft size={15} />
                <button className="font-semibold text-sm">Back to Chat</button>
            </Link>
            <div className="flex gap-2 items-center">
                <ThemeButton theme={theme || 'system'} onToggleTheme={toggleTheme} />
                <button className="font-semibold text-sm">Sign Out</button>
            </div>
        </div>

        <div className="flex w-full">
            <aside className={`w-[30%] max-md:invisible max-md:w-[0%] h-full overflow-y-auto`}>
                <div className="flex flex-col justify-center items-center gap-2 pt-8">
                    <CgProfile size={200} />
                    <p className="text-2xl font-bold">{session?.user?.username}</p>
                    <p className="text-lg">{session?.user?.email}</p>
                    <p className="text-xs font-bold p-2 bg-pink-500/20 rounded-full">Clone Tier</p>
                    <div className={`flex flex-col gap-6 w-[15em] my-8 ${theme === 'dark' ? 'bg-black/50' : 'bg-white'} rounded-xl p-5`}>
                        <p className="text-md font-bold">Keyboard Shortcuts</p>
                        <div className="flex justify-between gap-2">
                            <p className="text-sm">Search</p>
                            <p>{ShortcutFormat("⌘ + K")}</p>
                        </div>
                        <div className="flex justify-between gap-2">
                            <p className="text-sm">New Chat</p>
                            <p>{ShortcutFormat("⌘ + Shift + O")}</p>
                        </div>
                        <div className="flex justify-between gap-2">
                            <p className="text-sm">Toggle Sidebar</p>
                            <p>{ShortcutFormat("⌘ + B")}</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className={`w-[70%] h-full overflow-y-auto px-8 max-md:w-[100%]`}>
                <h2 className="!text-2xl !font-bold my-4">Customize Open Source T3 Chat</h2>
                <div className="my-4">
                    <p className="font-semibold my-4">What should T3 Chat call you?</p>
                    <input className={`pr-6 text-sm  border border-pink-500/50 w-full p-2 rounded-md bg-pink-500/5 ${theme === 'dark' ? '!placeholder-neutral-100/70' : '!placeholder-pink-800/70'}`} type="text" placeholder="Enter your name" />
                </div>
                <div className="my-4">
                    <p className="font-semibold my-4">What do you do?</p>
                    <input className={`pr-6 text-sm  border border-pink-500/50 w-full p-2 rounded-md bg-pink-500/5 ${theme === 'dark' ? '!placeholder-neutral-100/70' : '!placeholder-pink-800/70'}`} type="text" placeholder="Engineer, student, etc." />
                </div>
                <div className="my-4">
                    <p className="font-semibold my-4">What traits should T3 Chat have? (up to 50, max 100 chars each)</p>
                    <input className={`pr-6 text-sm  border border-pink-500/50 w-full p-2 rounded-md bg-pink-500/5 ${theme === 'dark' ? '!placeholder-neutral-100/70' : '!placeholder-pink-800/70'}`} type="text" placeholder="Type a trait and press Enter or tab" />
                </div>
                <div className="my-4">
                    <p className="font-semibold my-4">Anything else T3 Chat should know about you?</p>
                    <textarea className={`pr-6 text-sm border border-pink-500/50 w-full p-2 rounded-md bg-pink-500/5 ${theme === 'dark' ? '!placeholder-neutral-100/70' : '!placeholder-pink-800/70'}`} placeholder="Interests, values, or preferences to keep in mind" />
                </div>
                <div className="flex justify-end">
                    <button className="border border-pink-500/20 bg-pink-500/20 rounded-md p-2 my-2">Save Preference</button>
                </div>
                <h2 className="!text-2xl !font-bold my-4">Visual Options</h2>
                <div className="mb-24">
                    <p className="font-semibold">Main Text Font</p>
                    <p className="opacity-50">Used in general text throughout the app.</p>
                    <select className={`border my-2 border-pink-500/20 w-full p-2 rounded-md bg-pink-500/5 ${theme === 'dark' ? '!placeholder-neutral-100' : '!placeholder-pink-800'}`}>
                        <option value="system">Proxima Vara (default)</option>
                        <option value="sans">Inter</option>
                        <option value="serif">Comic Sans MS</option>
                    </select>
                </div>
            </main>
        </div>
    </div> );
}
 
export default SettingsPage;