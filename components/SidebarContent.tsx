export default function SidebarContent() {
    return (
      <div data-sidebar="content" className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[state=collapsed]:overflow-hidden small-scrollbar scroll-shadow relative pb-2">
        <div style={{ overflowAnchor: 'none', flex: '0 0 auto', position: 'relative', visibility: 'hidden', width: '100%', height: '0px' }}></div>
      </div>
    );
  }