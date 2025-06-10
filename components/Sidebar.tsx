import { PlusIcon, SearchIcon, LogInIcon } from '@/components/Icons';

interface SidebarProps {
  sidebarState: 'expanded' | 'collapsed';
  theme: string;
}

export default function Sidebar({ sidebarState, theme }: SidebarProps) {
  const isExpanded = sidebarState === 'expanded';

  return (
    <aside
      role="complementary"
      aria-label="Sidebar"
      className={`fixed top-0 left-0 h-full bg-gradient-to-t ${theme === 'dark' ? 'from-[#11040E] to-[#21141E]' : 'from-[#F2E1F4] to-[#F2E1F4]'} dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg transition-width duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-16'
      } overflow-hidden flex flex-col`}
    >
      <header className="flex items-center justify-center px-4 py-4 border-gray-200 dark:border-gray-700">
        {isExpanded ? (
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Open T3.chat</h1>
        ) : (
          <></>
        )}
      </header>
      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {isExpanded && (
          <>
            <button
              className="w-full flex bg-pink-700 items-center justify-center rounded-md px-4 py-2 text-white font-medium hover:opacity-90 transition"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              New Chat
            </button>
            <div className="relative flex items-center gap-2 w-full bg-gray-50 rounded-md">
              <SearchIcon className="h-4 w-4 text-gray-400 ml-2" />
              <input
                type="text"
                placeholder="Search threads..."
                className="w-full rounded-md py-2 pl-10 pr-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {/* Thread list */}
            <ul className="space-y-2">
              {/* Replace with dynamic items */}
              <li>
                <a href="#" className="block rounded px-2 py-1 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                  Sample Thread
                </a>
              </li>
            </ul>
          </>
        )}
        {!isExpanded && (
          <ul className="flex flex-col items-center space-y-4">
            <li>
              <PlusIcon className="h-6 w-6 text-gray-500" />
            </li>
            <li>
              <SearchIcon className="h-6 w-6 text-gray-500" />
            </li>
          </ul>
        )}
      </div>
      <footer className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        {isExpanded ? (
          <button className="flex items-center text-gray-700 hover:text-primary dark:text-gray-300">
            <LogInIcon className="mr-2 h-5 w-5" />
            Login
          </button>
        ) : (
          <LogInIcon className="h-6 w-6 text-gray-500" />
        )}
      </footer>
    </aside>
  );
}
