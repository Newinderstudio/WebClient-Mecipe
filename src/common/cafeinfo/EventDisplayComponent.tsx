'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useFindAllBoardsMutation, BoardResult } from '@/api/boardsApi';
import styled from '@emotion/styled';
import Image, { ImageProps } from 'next/image';
import { useRouter } from 'next/navigation';

interface EventDisplayComponentProps {
    className?: string;
}

const EventDisplayComponent: React.FC<EventDisplayComponentProps> = ({ className }) => {

    const router = useRouter();
    const [findAllBoards] = useFindAllBoardsMutation();
    const [todayEvents, setTodayEvents] = useState<BoardResult[]>([]);
    const [ongoingEvents, setOngoingEvents] = useState<BoardResult[]>([]);
    const [endedEvents, setEndedEvents] = useState<BoardResult[]>([]);
    const [activeTab, setActiveTab] = useState<'ongoing' | 'ended'>('ongoing');
    const [loading, setLoading] = useState(true);

    // 슬라이더 ref와 이미지 로드 카운트
    const todaySliderRef = useRef<HTMLDivElement>(null);
    const tabSliderRef = useRef<HTMLDivElement>(null);
    const todayLoadedImageCount = useRef(0);
    const tabLoadedImageCount = useRef(0);

    // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
    const getTodayString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 이벤트를 5개로 맞추는 함수 (부족하면 빈 카드로 채움)
    const getEventsWithPlaceholders = (events: BoardResult[], count: number = 5) => {
        const result = [];

        // 실제 이벤트 데이터 추가
        for (let i = 0; i < Math.min(events.length, count); i++) {
            result.push(events[i]);
        }

        // 부족한 만큼 빈 카드 추가
        for (let i = events.length; i < count; i++) {
            result.push(null);
        }

        return result;
    };

    // 5개씩 복제하여 무한 스크롤 효과 생성
    const createInfiniteScrollEvents = (events: BoardResult[]) => {
        const eventsWithPlaceholders = getEventsWithPlaceholders(events, 5);
        // 5개씩 3번 복제하여 연속적인 스크롤 효과 생성
        return [
            ...eventsWithPlaceholders, 
            ...eventsWithPlaceholders, 
            ...eventsWithPlaceholders
        ];
    };

    // 이미지 로드 완료 핸들러
    const handleImageLoad = (sliderRef: React.RefObject<HTMLDivElement | null>, loadedCountRef: React.MutableRefObject<number>, eventCount: number) => {
        loadedCountRef.current += 1;

        if (sliderRef.current && loadedCountRef.current === eventCount * 3) {
            // 모든 이미지가 로드되면 총 너비 계산
            const totalWidth = Array.from(sliderRef.current.children).reduce(
                (total, child) => total + (child as HTMLElement).getBoundingClientRect().width,
                0
            );

            // 1/3만큼 이동하여 자연스러운 무한 루프 구현
            const translateValue = `-${totalWidth / 3}px`;

            // CSS 변수로 설정
            sliderRef.current.style.setProperty('--carousel-translate', translateValue);
        }
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const today = getTodayString();

                // 오늘의 이벤트 (startDay가 오늘인 것, 5개)
                const todayResponse = await findAllBoards({
                    boardType: 'BEVENT',
                    inProgressDay: today,
                    limit: 5,
                    cafeInfoId: -1
                }).unwrap();

                // 현재 진행 중인 이벤트 (startDay가 오늘인 것, 5개)
                const ongoingResponse = await findAllBoards({
                    boardType: 'BEVENT',
                    inProgressDay: today,
                    limit: 5,
                    cafeInfoId: -1
                }).unwrap();

                // 종료된 이벤트 (endDay가 오늘인 것, 5개)
                const endedResponse = await findAllBoards({
                    boardType: 'BEVENT',
                    notInProgressDay: today,
                    limit: 5,
                    cafeInfoId: -1
                }).unwrap();

                if (todayResponse?.boards) setTodayEvents(todayResponse.boards);
                if (ongoingResponse?.boards) setOngoingEvents(ongoingResponse.boards);
                if (endedResponse?.boards) setEndedEvents(endedResponse.boards);
            } catch (error) {
                console.error('이벤트 데이터를 가져오는 중 오류가 발생했습니다:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [findAllBoards]);

    if (loading) {
        return (
            <Container className={className}>
                <LoadingText>이벤트를 불러오는 중...</LoadingText>
            </Container>
        );
    }

    return (
        <Container className={className}>
            {/* 소개 텍스트 */}
            <IntroText>
                혹시 실제 카페에 방문 중이신가요?
            </IntroText>
            <IntroText>
                &apos;메시피 X 카페&apos;에서 진행 중인 이벤트를 확인하고,
            </IntroText>
            <IntroText>
                메시피에서만 얻을 수 있는 달콤한 혜택 놓치지 마세요!
            </IntroText>

            {/* 오늘의 이벤트 */}
            <EventSection>
                <SectionTitle>오늘의 이벤트</SectionTitle>
                <SectionSubtitle>지금 가장 인기 있는 이벤트</SectionSubtitle>
                <EventSlider>
                    <EventSliderContent
                        ref={todaySliderRef}
                        className="animate-todayEventSlide"
                        onMouseEnter={() => {
                            if (todaySliderRef.current) {
                                todaySliderRef.current.style.animationPlayState = 'paused';
                            }
                        }}
                        onMouseLeave={() => {
                            if (todaySliderRef.current) {
                                todaySliderRef.current.style.animationPlayState = 'running';
                            }
                        }}
                    >
                        {createInfiniteScrollEvents(todayEvents).map((event, index) => (
                            <EventCard key={`today-${event?.id || index}-${index}`}
                                onClick={() => {
                                    if (event?.CafeBoards?.[0]?.cafeInfoId) {
                                        router.push(`/detail/${event.CafeBoards[0].cafeInfoId}`);
                                    }
                                }}
                            >
                                {event?.BoardImages && event.BoardImages.length > 0 ? (
                                    <EventImage 
                                        src={event.BoardImages[0].thumbnailUrl} 
                                        alt={event.title}
                                        onLoad={() => handleImageLoad(todaySliderRef, todayLoadedImageCount, todayEvents.length)}
                                    />
                                ) : (
                                    <EventImagePlaceholder />
                                )}
                                <EventTitle>{event?.title || '이벤트 준비 중'}</EventTitle>
                                <EventContent>{event?.content || ''}</EventContent>
                            </EventCard>
                        ))}
                    </EventSliderContent>
                </EventSlider>
            </EventSection>

            {/* 현재 진행 중인 이벤트 | 종료된 이벤트 */}
            <EventSection>
                <TabContainer>
                    <TabButton
                        active={activeTab === 'ongoing'}
                        onClick={() => setActiveTab('ongoing')}
                    >
                        현재 진행 중인 이벤트
                    </TabButton>
                    <TabDivider>|</TabDivider>
                    <TabButton
                        active={activeTab === 'ended'}
                        onClick={() => setActiveTab('ended')}
                    >
                        종료된 이벤트
                    </TabButton>
                </TabContainer>

                <EventSlider>
                    <EventSliderContent
                        ref={tabSliderRef}
                        className="animate-tabEventSlide"
                        onMouseEnter={() => {
                            if (tabSliderRef.current) {
                                tabSliderRef.current.style.animationPlayState = 'paused';
                            }
                        }}
                        onMouseLeave={() => {
                            if (tabSliderRef.current) {
                                tabSliderRef.current.style.animationPlayState = 'running';
                            }
                        }}
                    >
                        {createInfiniteScrollEvents(activeTab === 'ongoing' ? ongoingEvents : endedEvents).map((event, index) => (
                            <EventCard key={`${activeTab}-${event?.id || index}-${index}`}
                                onClick={() => {
                                    if (event?.CafeBoards?.[0]?.CafeInfo?.id) {
                                        router.push(`/detail/${event.CafeBoards[0].CafeInfo.id}`);
                                    }
                                }}
                            >
                                {event?.BoardImages && event.BoardImages.length > 0 ? (
                                    <EventImage 
                                        src={event.BoardImages[0].thumbnailUrl} 
                                        alt={event.title}
                                        onLoad={() => handleImageLoad(tabSliderRef, tabLoadedImageCount, (activeTab === 'ongoing' ? ongoingEvents : endedEvents).length)}
                                    />
                                ) : (
                                    <EventImagePlaceholder />
                                )}
                                <EventTitle>{event?.title || '이벤트 준비 중'}</EventTitle>
                                <EventContent>{event?.content || ''}</EventContent>
                            </EventCard>
                        ))}
                    </EventSliderContent>
                </EventSlider>
            </EventSection>
        </Container>
    );
};

// Styled Components
const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const LoadingText = styled.div`
  text-align: center;
  font-size: 18px;
  color: #666;
  padding: 40px 0;
`;

// 
const IntroText = styled.p`
  font-size: 1.5em;
  line-height: 1.6;
  color: #333;
  margin: 8px 0;
  font-weight: 400;
  
  &:first-of-type {
    font-weight: 600;
    color: #495057;
  }
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const EventSection = styled.div`
  margin-bottom: 50px;
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #212529;
  margin: 0 0 8px 0;
  text-align: center;
`;

const SectionSubtitle = styled.p`
  font-size: 16px;
  color: #6c757d;
  text-align: center;
  margin: 0 0 30px 0;
  font-weight: 400;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  font-size: 16px;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? '#007bff' : '#6c757d'};
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#e7f3ff' : '#f8f9fa'};
  }
`;

const TabDivider = styled.span`
  color: #dee2e6;
  font-weight: 300;
`;

const EventSlider = styled.div`
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const EventSliderContent = styled.div`
  display: flex;
  gap: 20px;
  
  /* CSS 변수 사용 */
  --carousel-translate: 0px;
  
  /* 애니메이션 적용 */
  &.animate-todayEventSlide {
    animation: todayEventSlide 15s linear infinite;
  }
  
  &.animate-tabEventSlide {
    animation: tabEventSlide 15s linear infinite;
  }
  
  /* 애니메이션 정의 */
  @keyframes todayEventSlide {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(var(--carousel-translate));
    }
  }
  
  @keyframes tabEventSlide {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(var(--carousel-translate));
    }
  }
  
  /* 호버 시 일시정지 */
  &:hover {
    animation-play-state: paused;
  }
`;

const EventCard = styled.div`
  min-width: 280px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const EventImage = (props: ImageProps & { onLoad?: () => void }) => (<div
    style={{
        width: '100%',
        height: '180px',
        position: 'relative',
    }}
>
    <Image {...props}
        src={props.src}
        alt={props.alt}
        objectFit="cover"
        layout="fill"
        onLoad={props.onLoad}
    />
</div>)

const EventImagePlaceholder = styled.div`
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 14px;
`;

const EventTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin: 16px 16px 8px 16px;
  line-height: 1.4;
`;

const EventContent = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin: 0 16px 16px 16px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export default EventDisplayComponent;
