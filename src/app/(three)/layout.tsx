"use client";

import { SocketProvider } from '@/common/socket';

function ThreeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SocketProvider serverUrl={process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3001'}>
            <div
                style={{
                    width: '100%',
                    minHeight: '100vh',
                }}
            >{children}</div>
        </SocketProvider>
    );
}

export default ThreeLayout;