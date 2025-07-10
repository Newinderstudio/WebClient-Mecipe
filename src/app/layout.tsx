import './globals.css';
import ReduxProvider from './store/ReduxProvider';
import Head from 'next/head';

function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <html lang="ko">
            <body
                data-new-gr-c-s-check-loaded="14.1243.0"
                data-gr-ext-installed=""
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