import Script from "next/script";

function MapLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div
            style={{
                width: '100%'
            }}
        >
            <Script
                type="text/javascript"
                src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=geocoder`}
            />
            {children}
        </div>
    );
}

export default MapLayout