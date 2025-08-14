"use client"

import MainSearchComponent from '@/common/input/MainSearchComponent';
import UserScreen from '@/common/screen/UserScreen';
import { FlexCenter } from '@/common/styledComponents';
import { fenxyYellowTransparency } from '@/util/constants/style';
import FullscreenImageRotator from './components/FullscreenImageRotator';
import { useMainScreen } from './hooks/useMainScreen';
import EventDisplayComponent from '@/common/cafeinfo/EventDisplayComponent';
import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';

function MainScreen() {
    const hookMember = useMainScreen();
    const eventSectionRef = useRef<HTMLDivElement>(null);
    const userScreenRef = useRef<HTMLDivElement>(null);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollDirection = currentScrollY > lastScrollY;
            const documentHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;
            const scrollPercentage = (currentScrollY / (documentHeight - windowHeight)) * 100;
            
            // 스크롤 방향이 아래로이고, UserScreen 영역을 벗어나려고 할 때 (페이지 하단 80% 이전까지만)
            if (scrollDirection && currentScrollY > 100 && scrollPercentage < 80 && eventSectionRef.current) {
                // EventDisplayContainer로 한 번에 이동
                eventSectionRef.current.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            
            // 스크롤 방향이 위로이고, EventDisplayContainer 영역에서 위로 올라가려고 할 때
            if (!scrollDirection && currentScrollY < window.innerHeight * 0.5 && userScreenRef.current) {
                // UserScreen으로 한 번에 이동
                userScreenRef.current.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <>

            <div ref={userScreenRef}>
                <UserScreen
                    headerOverlap={true}
                    backSpace={false}
                    fullScreen={true}
                    navigationList={[{ name: "카페탐색", routerUrl: "/search", isPulse: true }]}
                >
                    <MainStyledHeader>
                        <div style={{
                            animation: 'fadeInText 0.8s ease-in forwards',
                            animationDelay: '0.6s',
                            opacity: 0,
                        }}>
                            <div style={{ height: 72 }} />
                            <span>
                                메타버스에서 펼쳐지는&nbsp;
                            </span>
                            <span
                                style={{
                                    fontWeight: 700,
                                    fontSize: '2.5rem',
                                }}
                            >
                                당신의 특별한 하루, Mecipe
                            </span>
                            <span>
                                로부터
                            </span>
                        </div>
                    </MainStyledHeader>
                    <FlexCenter style={{ flexGrow: 1 }}>
                        <FullscreenImageRotator
                            imgList={[
                                '/image/cover/cover_1.jpg',
                                '/image/cover/cover_2.jpg',
                                '/image/cover/cover_3.jpg',
                                '/image/cover/cover_4.jpg',
                            ]}
                        />

                        <MainSearchComponent
                            onSearchAction={(text: string) => {
                                hookMember.onSearchText(text);
                            }}
                            height={5}
                            unit="rem"
                            maxWidth={700}
                            backgroundColor='#0009'
                            borderColor={fenxyYellowTransparency}
                            full={true}
                            style={{
                                padding: '0 20px',

                            }}
                            fontColor='#fff'
                            fontWeight={600}
                        />
                    </FlexCenter>
                    <div style={{ height: 72 }} />
                </UserScreen>
            </div>
            <EventDisplayContainer ref={eventSectionRef}>
                <EventDisplayComponent />
            </EventDisplayContainer>

        </>
    );
};
export default MainScreen;

const MainStyledHeader = styled.div({
    width: '100%',
    height: '10em',
    backgroundColor: '#0009',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '2rem',
    fontWeight: 300,
    textAlign: 'center',
    padding: '0 20px',
    animation: 'expandHeader 1.2s ease-out forwards',
    transformOrigin: 'top',
    overflow: 'hidden',
    zIndex: 0,
    '@keyframes expandHeader': {
        '0%': {
            height: '0',
            opacity: 0,
        },
        '40%': {
            height: '0',
            opacity: 0,
        },
        '100%': {
            height: '10em',
            opacity: 1,
        }
    },
    '@keyframes fadeInText': {
        '0%': {
            opacity: 0,
            transform: 'translateY(20px)',
        },
        '100%': {
            opacity: 1,
            transform: 'translateY(0)',
        }
    }
})

const EventDisplayContainer = styled.div({
    width: '100%',
    backgroundColor: '#fff',
    borderTop: '2px solid #f0f0f0',
    position: 'relative',
    paddingBottom: '2rem',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60px',
        height: '4px',
        backgroundColor: '#ddd',
        borderRadius: '2px',
    }
})