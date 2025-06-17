"use client";

import { CgProfile } from "react-icons/cg";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import ThemeButton from "@/components/ThemeButton";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AppFont } from "@/types";
import { useFont } from "@/components/FontProvider";
import { Slider } from "@/components/ui/slider";

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
    const { font: selectedFont, setFont: setSelectedFont } = useFont();
    const [hue, setHue] = useState(0);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);

    useEffect(() => {
        setMounted(true);
        
        const savedHue = localStorage.getItem('t3chat-hue');
        const savedContrast = localStorage.getItem('t3chat-contrast');
        const savedSaturation = localStorage.getItem('t3chat-saturation');
        
        if (savedHue) setHue(parseInt(savedHue));
        if (savedContrast) setContrast(parseInt(savedContrast));
        if (savedSaturation) setSaturation(parseInt(savedSaturation));
        
        if (savedHue) document.documentElement.style.setProperty('--hue-rotation', `${savedHue}deg`);
        if (savedContrast) document.documentElement.style.setProperty('--contrast-value', `${savedContrast}%`);
        if (savedSaturation) document.documentElement.style.setProperty('--saturation-value', `${savedSaturation}%`);
    }, []);


    if (!mounted) {
        return null;
    }
    
    const handleHueChange = (value: number[]) => {
        const newHue = value[0];
        setHue(newHue);
        document.documentElement.style.setProperty('--hue-rotation', `${newHue}deg`);
        localStorage.setItem('t3chat-hue', newHue.toString());
    };
    
    const handleContrastChange = (value: number[]) => {
        const newContrast = value[0];
        setContrast(newContrast);
        document.documentElement.style.setProperty('--contrast-value', `${newContrast}%`);
        localStorage.setItem('t3chat-contrast', newContrast.toString());
    };
    
    const handleSaturationChange = (value: number[]) => {
        const newSaturation = value[0];
        setSaturation(newSaturation);
        document.documentElement.style.setProperty('--saturation-value', `${newSaturation}%`);
        localStorage.setItem('t3chat-saturation', newSaturation.toString());
    };

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFont = e.target.value as AppFont;
        setSelectedFont(newFont);
    };

    return ( 
    <div 
        className="overflow-y-auto h-screen"
        style={{
            background: theme === 'dark'
                ? 'linear-gradient(to bottom, #1E141A, #0E040A)'
                : 'linear-gradient(to bottom, #FFECFF, #EFDCF5)'
        }}
    >
        <div className="flex justify-between gap-2 w-full px-24 py-6">
            <Link href="/" className="flex gap-2 items-center hover:bg-pink-500/20 cursor-pointer rounded-md py-2 px-4 transition-all duration-300">
                <ArrowLeft size={15} />
                <button className="font-semibold text-sm">Back to Chat</button>
            </Link>
            <div className="flex gap-2 items-center">
                <ThemeButton theme={theme || 'system'} onToggleTheme={toggleTheme} />
                <button 
                  onClick={() => { /* Implement sign out logic, e.g., signOut() from next-auth */ }}
                  className="font-semibold text-sm"
                >
                  Sign Out
                </button>
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
                    <input className={`pr-6 text-sm  border border-pink-500 w-full p-2 rounded-md bg-pink-500/5 ${theme === 'dark' ? '!placeholder-neutral-100/70' : '!placeholder-pink-800/70'}`} type="text" placeholder="Enter your name" />
                </div>
                <div className="my-4">
                    <p className="font-semibold my-4">What do you do?</p>
                    <input className={`pr-6 text-sm  border border-pink-500 w-full p-2 rounded-md bg-pink-500/5 ${theme === 'dark' ? '!placeholder-neutral-100/70' : '!placeholder-pink-800/70'}`} type="text" placeholder="Engineer, student, etc." />
                </div>
                <div className="my-4">
                    <p className="font-semibold my-4">What traits should T3 Chat have? (up to 50, max 100 chars each)</p>
                    <input className={`pr-6 text-sm  border border-pink-500 w-full p-2 rounded-md bg-pink-500/5 ${theme === 'dark' ? '!placeholder-neutral-100/70' : '!placeholder-pink-800/70'}`} type="text" placeholder="Type a trait and press Enter or tab" />
                </div>
                <div className="my-4">
                    <p className="font-semibold my-4">Anything else T3 Chat should know about you?</p>
                    <textarea className={`pr-6 text-sm border border-pink-500 w-full p-2 rounded-md bg-pink-500/5 ${theme === 'dark' ? '!placeholder-neutral-100/70' : '!placeholder-pink-800/70'}`} placeholder="Interests, values, or preferences to keep in mind" />
                </div>
                <div className="flex justify-end">
                    <button className="border border-pink-500/20 bg-pink-500 rounded-md p-2 my-2">Save Preference</button>
                </div>
                <h2 className="!text-2xl !font-bold my-4">Visual Options</h2>
                <div className="mb-24">
                    <div className="mb-6">
                        <p className="font-semibold mb-2">Color Hue</p>
                        <p className="opacity-50 mb-2">Adjust the hue rotation of the app's colors.</p>
                        <div className="flex items-center gap-4">
                            <div className="w-full">
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={hue}
                                    onChange={(e) => handleHueChange([parseInt(e.target.value)])}
                                    className={`w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-pink-900/30' : 'bg-pink-200'}`}
                                />
                            </div>
                            <span className="min-w-[40px] text-center">{hue}°</span>
                        </div>
                        <div className={`mt-2 p-3 rounded-md ${theme === 'dark' ? 'bg-black/30' : 'bg-white/70'} border border-pink-500/20`}>
                            <div className="w-full h-6 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-md"
                                 style={{ filter: `hue-rotate(${hue}deg)` }}></div>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <p className="font-semibold mb-2">Contrast</p>
                        <p className="opacity-50 mb-2">Adjust the contrast of the app's interface.</p>
                        <div className="flex items-center gap-4">
                            <div className="w-full">
                                <input
                                    type="range"
                                    min="50"
                                    max="150"
                                    value={contrast}
                                    onChange={(e) => handleContrastChange([parseInt(e.target.value)])}
                                    className={`w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-pink-900/30' : 'bg-pink-200'}`}
                                />
                            </div>
                            <span className="min-w-[40px] text-center">{contrast}%</span>
                        </div>
                        <div className={`mt-2 p-3 rounded-md ${theme === 'dark' ? 'bg-black/30' : 'bg-white/70'} border border-pink-500/20`}>
                            <div className="flex justify-between">
                                <div className="w-1/3 h-6 bg-pink-500 rounded-md"
                                     style={{ filter: `contrast(${contrast}%)` }}></div>
                                <div className="w-1/3 h-6 bg-purple-500 rounded-md"
                                     style={{ filter: `contrast(${contrast}%)` }}></div>
                                <div className="w-1/3 h-6 bg-blue-500 rounded-md"
                                     style={{ filter: `contrast(${contrast}%)` }}></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <p className="font-semibold mb-2">Saturation</p>
                        <p className="opacity-50 mb-2">Adjust the color saturation of the app.</p>
                        <div className="flex items-center gap-4">
                            <div className="w-full">
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={saturation}
                                    onChange={(e) => handleSaturationChange([parseInt(e.target.value)])}
                                    className={`w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer ${theme === 'dark' ? 'bg-pink-900/30' : 'bg-pink-200'}`}
                                />
                            </div>
                            <span className="min-w-[40px] text-center">{saturation}%</span>
                        </div>
                        <div className={`mt-2 p-3 rounded-md ${theme === 'dark' ? 'bg-black/30' : 'bg-white/70'} border border-pink-500/20`}>
                            <div className="w-full h-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-md"
                                 style={{ filter: `saturate(${saturation}%)` }}></div>
                        </div>
                    </div>
                    <p className="font-semibold">Main Text Font</p>
                    <p className="opacity-50">Used in general text throughout the app.</p>
                    <select 
                        className={`border my-2 border-pink-500/20 w-full p-2 rounded-md bg-pink-500/5 ${theme === 'dark' ? '!placeholder-neutral-100' : '!placeholder-pink-800'}`}
                        value={selectedFont}
                        onChange={handleFontChange}
                    >
                        <option value="proxima-nova">Proxima Nova (Default)</option>
                        <option value="inter">Inter</option>
                        <option value="comic-sans">Comic Sans MS</option>
                    </select>
                    <div className="mt-4">
                        <p className="font-semibold mb-2">Font Preview:</p>
                        <div className={`p-3 rounded-md ${theme === 'dark' ? 'bg-black/30' : 'bg-white/70'} border border-pink-500/20`}>
                            <p className="mb-2">This is how your selected font looks.</p>
                            <p className="font-bold">Bold text in {selectedFont === 'proxima-nova' ? 'Proxima Nova' : selectedFont === 'inter' ? 'Inter' : 'Comic Sans MS'}.</p>
                            <p className="italic">Italic text in {selectedFont === 'proxima-nova' ? 'Proxima Nova' : selectedFont === 'inter' ? 'Inter' : 'Comic Sans MS'}.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div> );
}
 
export default SettingsPage;