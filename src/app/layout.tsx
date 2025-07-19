import { redirectUrl } from '@/util/constants/app';
import './globals.css';
import ReduxProvider from './store/ReduxProvider';
import Head from 'next/head';

export const metadata = {
    title: '메시피 가상현실 투어',
    description: '메시피 가상현실 투어',
    images: {
        url: redirectUrl + '/image/logo/logo-mecipe-text.svg',
        width: 1200,
        height: 630,
        alt: '메시피 가상현실 투어'
    }
}

function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <html lang="ko"
            suppressHydrationWarning
        >
            <body
            // data-new-gr-c-s-check-loaded="14.1243.0"
            // data-gr-ext-installed=""
            >
                <ReduxProvider>
                    <Head>
                        <script
                        />

                    </Head>
                    <div>
                        {children}
                    </div>
                </ReduxProvider>
            </body>
        </html >
    );
}

export default RootLayout