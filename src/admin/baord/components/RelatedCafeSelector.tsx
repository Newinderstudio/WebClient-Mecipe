'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { BorderRoundedContent, ContentHeader, StyledButton, TheadSmall, InputStyle } from '@/common/styledAdmin';
import { Flex, FlexRow } from '@/common/styledComponents';
import { fenxyBlue } from '@/util/constants/style';
import { CafeInfoResult } from '@/api/cafeInfosApi';
import { useFindAllPlacesBySearchMutation } from '@/api/cafeInfosApi';

interface RelatedCafeSelectorProps {
    isEditing?: boolean;
    selectedCafeInfos?: CafeInfoResult[];
    onCafeSelect: (cafe: CafeInfoResult[]) => void;
}

const RelatedCafeSelector: React.FC<RelatedCafeSelectorProps> = ({
    isEditing = true,
    selectedCafeInfos: initialSelectedCafeInfos,
    onCafeSelect
}) => {
    const [cafeSearchText, setCafeSearchText] = useState<string>('');
    const [cafes, setCafes] = useState<CafeInfoResult[]>([]);
    const [isSearchingCafes, setIsSearchingCafes] = useState(false);
    const [selectedCafeInfos, setSelectedCafeInfos] = useState<CafeInfoResult[]>([]);
    const [prevSelectedCafeInfos, setPrevSelectedCafeInfos] = useState<CafeInfoResult[]>([]);
    const [curOptionCafeInfos, setCurOptionCafeInfos] = useState<CafeInfoResult[]>([]);

    useEffect(() => {
        if (initialSelectedCafeInfos && initialSelectedCafeInfos.length > 0) {
            setSelectedCafeInfos(initialSelectedCafeInfos);
            setPrevSelectedCafeInfos(initialSelectedCafeInfos);
        }
    }, [initialSelectedCafeInfos]);

    useEffect(() => {
        setCurOptionCafeInfos([...prevSelectedCafeInfos, ...selectedCafeInfos.filter(cafe => !prevSelectedCafeInfos.find(selectedCafe => selectedCafe.id === cafe.id))]);
    }, [selectedCafeInfos, prevSelectedCafeInfos]);

    const isCafeSelected = useCallback((cafe: CafeInfoResult) => {
        return selectedCafeInfos.findIndex(selectedCafe => selectedCafe.id === cafe.id) !== -1;
    }, [selectedCafeInfos]);


    const [findAllPlaces] = useFindAllPlacesBySearchMutation();

    const handleCafeSearch = useCallback(async () => {
        if (!cafeSearchText.trim()) return;

        try {
            setIsSearchingCafes(true);
            const result = await findAllPlaces({
                skip: 0,
                take: 50,
                searchText: cafeSearchText.trim()
            }).unwrap();

            setCafes(result.data);
        } catch (err) {
            console.error('카페 검색 실패:', err);
            setCafes([]);
        } finally {
            setIsSearchingCafes(false);
        }
    }, [cafeSearchText, findAllPlaces]);

    const handleCafeSelect = (cafe: CafeInfoResult) => {
        const newSelectedCafeInfos = selectedCafeInfos.includes(cafe) ? selectedCafeInfos.filter(selectedCafe => selectedCafe.id !== cafe.id) : [...selectedCafeInfos, cafe];
        setSelectedCafeInfos(newSelectedCafeInfos);
        onCafeSelect(newSelectedCafeInfos);
    }

    const onChangeCafeSearchText = (searchText: string) => {
        setCafeSearchText(searchText);
    };

    return (
        <BorderRoundedContent style={{ padding: 30 }}>
            <ContentHeader>연관 카페</ContentHeader>
            <Flex style={{ padding: '0 30px 30px 30px' }}>
                <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                    <Flex style={{ width: '100%' }}>
                        <TheadSmall>
                            카페 검색
                        </TheadSmall>
                        <FlexRow style={{ color: '#999' }}>
                            <InputStyle
                                type="text"
                                placeholder="카페명으로 검색..."
                                onChange={(e) => onChangeCafeSearchText(e.target.value)}
                                value={cafeSearchText}
                                style={{ flexGrow: 1 }}
                            />
                            <StyledButton
                                onClick={handleCafeSearch}
                                style={{ background: !isEditing ? '#4A5864' : fenxyBlue, cursor: !isEditing ? 'not-allowed' : 'pointer' }}
                            >
                                검색
                            </StyledButton>
                        </FlexRow>
                    </Flex>

                    {isSearchingCafes && <div>검색 중...</div>}
                    {cafes.length > 0 && (
                        <Flex style={{ width: '100%' }}>
                            <div style={{
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {cafes.map(cafe => (
                                    <div
                                        key={cafe.id}
                                        style={{
                                            padding: '8px 12px',
                                            borderBottom: '1px solid #f3f4f6',
                                            cursor: 'pointer',
                                            backgroundColor: isCafeSelected(cafe) ? '#EFF6FF' : 'transparent'
                                        }}
                                        onClick={() => handleCafeSelect(cafe)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isCafeSelected(cafe)}
                                            onChange={() => { }} // onClick에서 처리
                                            style={{ marginRight: '8px' }}
                                            disabled={!isEditing}
                                        />
                                        {cafe.name}
                                    </div>
                                ))}
                            </div>
                        </Flex>
                    )}
                    {curOptionCafeInfos.length > 0 && (
                        <Flex style={{ width: '100%' }}>
                            <div style={{
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {curOptionCafeInfos.map(cafe => (
                                    <div
                                        key={cafe.id}
                                        style={{
                                            padding: '8px 12px',
                                            borderBottom: '1px solid #f3f4f6',
                                            cursor: 'pointer',
                                            backgroundColor: isCafeSelected(cafe) ? '#EFF6FF' : 'transparent'
                                        }}
                                        onClick={() => handleCafeSelect(cafe)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isCafeSelected(cafe)}
                                            onChange={() => { }} // onClick에서 처리
                                            style={{ marginRight: '8px' }}
                                            disabled={!isEditing}
                                        />
                                        {cafe.name}
                                    </div>
                                ))}
                            </div>
                        </Flex>
                    )}
                    {selectedCafeInfos.length > 0 && (
                        <Flex style={{ width: '100%' }}>
                            <div style={{ marginTop: '8px', fontSize: '14px', color: '#6B7280' }}>
                                선택된 카페: {selectedCafeInfos.length}개
                            </div>
                        </Flex>
                    )}
                </Flex>
            </Flex>
        </BorderRoundedContent>
    );
};

export default RelatedCafeSelector;
