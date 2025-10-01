// ✅ Zustand는 Provider가 필요 없습니다!

export default function VirtualWorldLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>;
}