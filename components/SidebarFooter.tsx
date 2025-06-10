import { LogInIcon } from '@/components/Icons';

export default function SidebarFooter() {
  return (
    <div data-sidebar="footer" className="flex flex-col gap-2 m-0 p-2 pt-0">
      <a aria-label="Login" role="button" className="flex w-full select-none items-center gap-4 rounded-lg p-4 text-muted-foreground hover:bg-sidebar-accent" href="/auth" data-discover="true">
        <LogInIcon className="size-4" />
        <span>Login</span>
      </a>
    </div>
  );
}