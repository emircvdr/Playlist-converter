export default function LiquidGlassCard({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
    return (

        <div className="relative flex items-center p-3 justify-center backdrop-blur bg-white/10 border border-white/10 saturate-120 shadow-[inset_2px_2px_3px_-1px_#ffffff70,inset_-2px_-2px_3px_-1px_#ffffff70,inset_0_0_16px_#ffffff50,0_4px_12px_-2px_#ffffff40] rounded-md w-40 h-40 text-white/80 text-4xl transition-[left,top] duration-200 select-none cursor-pointer"
            onClick={onClick}>
            {children}
        </div>
    )

}