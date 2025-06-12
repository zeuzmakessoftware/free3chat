import { SearchIcon, LogInIcon } from '@/components/Icons';
import HoldTooltip from './HoldTooltip';
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
      className={`fixed top-0 left-0 h-full bg-gradient-to-t ${theme === 'dark' ? 'from-[#11040E] to-[#1C151A]' : 'from-[#F2E1F4] to-[#F2E1F4]'} dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg transition-width duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-16'
      } overflow-visible flex flex-col z-10`}
    >
      <header className="flex items-center justify-center px-4 py-4 border-gray-200 dark:border-gray-700">
        {isExpanded ? (
          <h1 className={`text-xl !font-bold ${theme === 'dark' ? 'text-[#f2c0d7]' : 'text-[#ba4077]'}`}>OST3.chat</h1>
        ) : (
          <div className="w-6 h-6"></div>
        )}
      </header>
      <div className="flex-1 px-4 space-y-4 overflow-visible">
        {isExpanded && (
          <>
            <HoldTooltip tooltip="" shortcut={["⌘", "Shift", "O"]} position="right" theme={theme} className="w-full">
            <button
              className={`w-full flex border !border-[#3e183d]/50 ${theme === 'dark' ? 'bg-radial from-[#5e183d] to-[#401020] text-[#f2c0d7] hover:from-[#8e486d] hover:to-[#6e284d]' : 'bg-[#aa3067] text-[#f2f0f7] hover:bg-[#ea70a7] hover:text-[#f2f0f7]'} items-center justify-center rounded-md px-4 py-2 font-bold text-sm transition`}
            >
              <span>New Chat</span>
            </button>
            </HoldTooltip>
            <div className="flex items-center w-full px-1" style={{ marginTop: '0rem', borderBottom: theme === 'dark' ? '1px solid #2C252A' : '1px solid #E2C1D4' }}>
              <SearchIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-[#f2c0d7]' : 'text-[#ba4077]'}`} />
              <input
                id="threads"
                type="text"
                placeholder="Search your threads..."
                className={`w-full rounded-md py-2 pl-2 pr-4 text-[14px] ${theme === 'dark' ? '!placeholder-[#927987]' : '!placeholder-[#b27987]'} focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>
            <ul className="space-y-2">
              {/* <li> I'll uncomment once I get chat history working
                <a href="#" className="block rounded px-2 py-1 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                  Sample Thread
                </a>
              </li> */}
            </ul>
          </>
        )}
        {!isExpanded && (
          <></>
        )}
      </div>
      <footer className="px-4 py-4">
        {isExpanded ? (
          <button className={`flex items-center hover:text-primary p-4 ${theme === 'dark' ? 'text-[#f2c0d7]' : 'text-[#ba4077]'}`}>
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
