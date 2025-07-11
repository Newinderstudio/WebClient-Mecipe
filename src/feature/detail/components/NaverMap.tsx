"use client"

import Script from "next/script";
import { useCallback, useEffect, useState } from "react";

declare global {
    interface Window {
        naver: unknown;
    }
}

interface NaverMapProps {
    width?: string;
    height?: string;
    address?: string;
    zoom?: number
    title?: string
}

const NaverMap = ({ width, height, address, zoom = 15, title }: NaverMapProps) => {

    const [firstAmount, setFirstAmount] = useState<boolean>(false);

    console.log(`width=${width},height:${height},address:${address},zoom:${zoom},title:${title},firstAmount:${firstAmount}`);


    const initMap = useCallback((x: number, y: number, targetTitle: string | undefined, targetZoom: number) => {
        const map = new window.naver.maps.Map("naver_map", {
            center: new window.naver.maps.LatLng(x, y),
            zoom: targetZoom,
            zoomControl: true,
            zoomControlOptions: {
                position: window.naver.maps.Position.TOP_RIGHT,
            },
        });

        new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(x, y),
            map: map,
            title: targetTitle
        });
    }, []);

    const initializeMap = useCallback((targetAddress: string, targetTitle: string | undefined, targetZoom: number) => {
        if (
            !window.naver ||
            !window.naver.maps ||
            !window.naver.maps.Service ||
            !window.naver.maps.Service.geocode
        ) {
            console.warn('Naver Map API not fully loaded yet')
            return
        }


        console.log('window.naver: ' + (window.naver));

        console.log(window.naver.maps);

        window.naver.maps.Service.geocode(
            {
                query: targetAddress,
            },
            function (status, response) {
                if (status === window.naver.maps.Service.Status.ERROR) {
                    return alert("Someting Wrong!");
                }

                const result = response.v2.addresses[0];
                const x = Number(result.x);
                const y = Number(result.y);

                console.log(`lang: ${x}/ lat:${y}`);

                initMap(y, x, targetTitle, targetZoom);
            }
        );
    }, [initMap]);

    const onLoadedAction = useCallback(() => {
        if (address === undefined || firstAmount === true || window.naver === undefined || window.naver.maps === undefined) return;

        if (window.naver.maps.jsContentLoaded === true) {
            initializeMap(address, title, zoom)
        } else {
            window.naver.maps.onJSContentLoaded = () => {
                initializeMap(address, title, zoom)
            }
        }
        setFirstAmount(true);
    }, [address, initializeMap, title, zoom, firstAmount])

    useEffect(() => {
        onLoadedAction();
    },[onLoadedAction])

    return (
        <>
            <Script type="text/javascript" src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=geocoder`} onLoad={onLoadedAction} />
            <div id="naver_map" style={{ width, height }} />
        </>
    )
}

export default NaverMap;