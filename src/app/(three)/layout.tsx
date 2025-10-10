function ThreeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div
            style={{
                width: '100%',
                minHeight: '100vh',
            }}
        >{children}</div>
    );
}

export default ThreeLayout;