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
import HideUrlPopUpWrapperWithSuspense from '@/common/popup/HideUrlPopUpWrapperWithSuspense';

function MainScreen() {

    const hookMember = useMainScreen();
    const eventSectionRef = useRef<HTMLDivElement>(null);
    const userScreenRef = useRef<HTMLDivElement>(null);
    const [currentSection, setCurrentSection] = useState<'section1' | 'section2'>('section1');
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);

    const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);

    // const handleScroll = useCallback(() => {
    //     if (isAutoScrolling) return; // 자동 스크롤 중이면 무시

    //     const currentScrollY = window.scrollY;

    //     // 섹션 1에서 아래로 100px 이상 스크롤하면 섹션 2로 이동
    //     if (currentSection === 'section1' && currentScrollY > 100 && eventSectionRef.current) {
    //         setIsAutoScrolling(true);
    //         setCurrentSection('section2');
    //         eventSectionRef.current.scrollIntoView({
    //             behavior: 'smooth',
    //             block: 'start'
    //         });

    //         if (scrollTimeout) clearTimeout(scrollTimeout);
    //         // 스크롤 완료 후 잠금 해제
    //         setScrollTimeout(setTimeout(() => {
    //             setIsAutoScrolling(false);
    //         }, 2000));
    //     }

    //     // 섹션 2에서 위로 올라가면 섹션 1로 이동 (섹션 2 영역을 벗어날 때)
    //     else if (currentSection === 'section2' && eventSectionRef.current) {
    //         const eventSectionTop = eventSectionRef.current.offsetTop;
    //         if (currentScrollY < eventSectionTop - 50) { // 섹션 2 시작점에서 50px 위로 올라가면
    //             setIsAutoScrolling(true);
    //             setCurrentSection('section1');
    //             userScreenRef.current?.scrollIntoView({
    //                 behavior: 'smooth',
    //                 block: 'start'
    //             });

    //             if (scrollTimeout) clearTimeout(scrollTimeout);
    //             // 스크롤 완료 후 잠금 해제
    //             setScrollTimeout(setTimeout(() => {
    //                 setIsAutoScrolling(false);
    //             }, 2000));
    //         }
    //     }
    // }, [currentSection, isAutoScrolling, scrollTimeout]);

    // const handleScrollEnd = useCallback(() => {
    //     if (isAutoScrolling) {
    //         setTimeout(() => {
    //             setIsAutoScrolling(false);
    //         }, 500);
    //     }
    // }, [isAutoScrolling]);

    useEffect(() => {

        const handleScroll = () => {
            if (isAutoScrolling) return; // 자동 스크롤 중이면 무시

            const currentScrollY = window.scrollY;

            // 섹션 1에서 아래로 100px 이상 스크롤하면 섹션 2로 이동
            if (currentSection === 'section1' && currentScrollY > 100 && eventSectionRef.current) {
                setIsAutoScrolling(true);
                setCurrentSection('section2');
                eventSectionRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                if (scrollTimeout) clearTimeout(scrollTimeout);
                // 스크롤 완료 후 잠금 해제
                setScrollTimeout(setTimeout(() => {
                    setIsAutoScrolling(false);
                }, 2000));
            }

            // 섹션 2에서 위로 올라가면 섹션 1로 이동 (섹션 2 영역을 벗어날 때)
            else if (currentSection === 'section2' && eventSectionRef.current) {
                const eventSectionTop = eventSectionRef.current.offsetTop;
                if (currentScrollY < eventSectionTop - 50) { // 섹션 2 시작점에서 50px 위로 올라가면
                    setIsAutoScrolling(true);
                    setCurrentSection('section1');
                    userScreenRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    if (scrollTimeout) clearTimeout(scrollTimeout);
                    // 스크롤 완료 후 잠금 해제
                    setScrollTimeout(setTimeout(() => {
                        setIsAutoScrolling(false);
                    }, 2000));
                }
            }

        }
        const handleScrollEnd = () => {
            if (isAutoScrolling) {
                if (scrollTimeout) clearTimeout(scrollTimeout);
                setScrollTimeout(setTimeout(() => {
                    setIsAutoScrolling(false);
                }, 500));
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('scrollend', handleScrollEnd, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('scrollend', handleScrollEnd);
            if (scrollTimeout) clearTimeout(scrollTimeout);
        };

    }, [currentSection, isAutoScrolling, scrollTimeout, eventSectionRef, userScreenRef]);

    useEffect(() => {
        if (!isAutoScrolling && userScreenRef.current && eventSectionRef.current) {
            if (currentSection === 'section1') {
                userScreenRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            else if (currentSection === 'section2') {
                eventSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }, [currentSection, isAutoScrolling]);

    return (
        <>
            <HideUrlPopUpWrapperWithSuspense queryName="contact" />
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
                            initSearchText={'대전 수통골 카페'}
                        />
                    </FlexCenter>
                    <div style={{ height: 72 }} />
                </UserScreen>
            </div>
            <EventDisplayContainer ref={eventSectionRef}>
                <EventDisplayComponent>
                    {/* 소개 텍스트 */}
                    <div style={{ paddingTop: 60, paddingBottom: 20 }}>
                        <IntroTextTitle>
                            혹시 실제 카페에 방문 중이신가요?
                        </IntroTextTitle>
                        <IntroText>
                            &apos;메시피 X 카페&apos;에서 진행 중인 이벤트를 확인하고,
                        </IntroText>
                        <IntroText>
                            메시피에서만 얻을 수 있는 달콤한 혜택 놓치지 마세요!
                        </IntroText>
                    </div>

                </EventDisplayComponent>
            </EventDisplayContainer>

        </>
    );
};
export default MainScreen;

const IntroTextTitle = styled.p`
  font-size: 2em;
  line-height: 1.6;
  margin: 8px 0;
  
  font-weight: 600;
  color: #495057;
  text-align: center;
`;

const IntroText = styled.p`
  font-size: 1.5em;
  line-height: 1.6;
  color: #333;
  margin: 0;
  font-weight: 400;
  text-align: center;
`;

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