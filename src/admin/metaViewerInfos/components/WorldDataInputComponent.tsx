'use client'

import { Flex, FlexRow } from "@/common/styledComponents";
import { InputStyle, TheadSmall, BorderRoundedContent } from "@/common/styledAdmin";
import { WorldData, Vector3 } from "@/api/dto/metaViwerInfosApiDto";

interface Props {
    worldData: Partial<WorldData>;
    onChange: (worldData: Partial<WorldData>) => void;
}

const WorldDataInputComponent: React.FC<Props> = ({ worldData, onChange }) => {
    const updateVector3 = (field: keyof WorldData, axis: 'x' | 'y' | 'z', value: string) => {
        const current = (worldData[field] as Vector3) || { x: 0, y: 0, z: 0 };
        onChange({
            ...worldData,
            [field]: {
                ...current,
                [axis]: parseFloat(value) || 0
            }
        });
    };

    const updateNumber = (field: keyof WorldData, value: string) => {
        onChange({
            ...worldData,
            [field]: parseFloat(value) || 0
        });
    };

    const updateString = (field: keyof WorldData, value: string) => {
        onChange({
            ...worldData,
            [field]: value
        });
    };

    const Vector3Input = ({ 
        label, 
        field, 
        required = false 
    }: { 
        label: string; 
        field: keyof WorldData; 
        required?: boolean;
    }) => {
        const value = (worldData[field] as Vector3) || { x: 0, y: 0, z: 0 };
        return (
            <Flex style={{ width: '100%' }}>
                <TheadSmall>
                    {label}{required && <span>*</span>}
                </TheadSmall>
                <FlexRow style={{ gap: 10 }}>
                    <Flex style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: 5 }}>X</label>
                        <InputStyle
                            type="number"
                            step="0.1"
                            value={value.x}
                            onChange={(e) => updateVector3(field, 'x', e.target.value)}
                            placeholder="X"
                        />
                    </Flex>
                    <Flex style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: 5 }}>Y</label>
                        <InputStyle
                            type="number"
                            step="0.1"
                            value={value.y}
                            onChange={(e) => updateVector3(field, 'y', e.target.value)}
                            placeholder="Y"
                        />
                    </Flex>
                    <Flex style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: 5 }}>Z</label>
                        <InputStyle
                            type="number"
                            step="0.1"
                            value={value.z}
                            onChange={(e) => updateVector3(field, 'z', e.target.value)}
                            placeholder="Z"
                        />
                    </Flex>
                </FlexRow>
            </Flex>
        );
    };

    return (
        <>
            {/* 플레이어 정보 섹션 */}
            <BorderRoundedContent style={{ padding: 30, marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20, color: '#333' }}>
                    플레이어 정보
                </div>
                <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                    <Flex style={{ width: 'calc(50% - 15px)' }}>
                        <TheadSmall>신장 (Player Height)</TheadSmall>
                        <InputStyle
                            type="number"
                            step="0.01"
                            value={worldData.playerHeight || 1.7}
                            onChange={(e) => updateNumber('playerHeight', e.target.value)}
                            placeholder="1.7"
                        />
                    </Flex>
                    <Flex style={{ width: 'calc(50% - 15px)' }}>
                        <TheadSmall>몸 둘레 (Player Radius)</TheadSmall>
                        <InputStyle
                            type="number"
                            step="0.01"
                            value={worldData.playerRadius || 0.3}
                            onChange={(e) => updateNumber('playerRadius', e.target.value)}
                            placeholder="0.3"
                        />
                    </Flex>
                    
                    <Vector3Input label="스폰 지점 (Spawn Point)" field="spawnPoint" />
                    
                    <Flex style={{ width: 'calc(50% - 15px)' }}>
                        <TheadSmall>점프력 (Jump Force)</TheadSmall>
                        <InputStyle
                            type="number"
                            step="0.1"
                            value={worldData.playerJumpForce || 5}
                            onChange={(e) => updateNumber('playerJumpForce', e.target.value)}
                            placeholder="5"
                        />
                    </Flex>
                    <Flex style={{ width: 'calc(50% - 15px)' }}>
                        <TheadSmall>속도 (Player Speed)</TheadSmall>
                        <InputStyle
                            type="number"
                            step="0.1"
                            value={worldData.playerSpeed || 5}
                            onChange={(e) => updateNumber('playerSpeed', e.target.value)}
                            placeholder="5"
                        />
                    </Flex>
                    
                    <Vector3Input label="크기 (Player Scale)" field="playerScale" />
                    <Vector3Input label="방향 (Player Rotation)" field="playerRotation" />
                    
                    <Flex style={{ width: 'calc(50% - 15px)' }}>
                        <TheadSmall>회전 속도 (Rotation Speed)</TheadSmall>
                        <InputStyle
                            type="number"
                            step="0.1"
                            value={worldData.playerRotationSpeed || 1}
                            onChange={(e) => updateNumber('playerRotationSpeed', e.target.value)}
                            placeholder="1"
                        />
                    </Flex>
                    <Flex style={{ width: 'calc(50% - 15px)' }}>
                        <TheadSmall>기본 애니메이션 (Default Animation Clip)</TheadSmall>
                        <InputStyle
                            type="text"
                            value={worldData.defaultAnimationClip || ''}
                            onChange={(e) => updateString('defaultAnimationClip', e.target.value)}
                            placeholder="idle"
                        />
                    </Flex>
                </Flex>
            </BorderRoundedContent>

            {/* 월드 정보 섹션 */}
            <BorderRoundedContent style={{ padding: 30, marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20, color: '#333' }}>
                    월드 정보
                </div>
                <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                    <Vector3Input label="위치 (World Position)" field="worldPosition" />
                    <Vector3Input label="회전 (World Rotation)" field="worldRotation" />
                    <Vector3Input label="크기 (World Scale)" field="worldScale" />
                </Flex>
            </BorderRoundedContent>
        </>
    );
};

export default WorldDataInputComponent;

