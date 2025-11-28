"use client"

interface HeaderProps {
  balance: number
}

export function Header({ balance }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="flex items-center justify-between w-full">
        {/* LEFT corner - Green $$ */}
        <div className="text-[#00FF00] text-xl font-bold">
          $$
        </div>
        
        {/* RIGHT corner - Small white wallet icon + white balance */}
        <div className="flex items-center gap-1"> 
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
          <span className="text-white text-base font-semibold">${balance.toLocaleString()}</span>
        </div>
      </div>
    </header>
  )
}