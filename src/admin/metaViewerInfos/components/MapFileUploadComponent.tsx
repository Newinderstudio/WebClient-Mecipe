'use client'

import { FlexCenter, FlexRow } from "@/common/styledComponents";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { StyledButton } from "@/common/styledAdmin";
import fetchMetaViewerMap from "@/util/fetchMetaViewerMap";

interface Props {
    label: string;
    mapType: 'render' | 'collider';
    displayId: string;
}

export interface MapUploadData {
    url: string;
    size: number;
    version: number;
}

export interface MapFileUploadComponentHandler {
    uploadMap: (token: string, version: number) => Promise<MapUploadData | null>;
    hasFile: () => boolean;
    clear: () => void;
}

const MapFileUploadComponent = forwardRef<MapFileUploadComponentHandler, Props>(
    function MapFileUploadComponent(props: Props, ref) {
        const [selectedFile, setSelectedFile] = useState<File | null>(null);
        const [fileName, setFileName] = useState<string>('');
        const [isUploading, setIsUploading] = useState(false);

        const uploadMap = useCallback(async (token: string, version: number): Promise<MapUploadData | null> => {
            if (!selectedFile) return null;

            setIsUploading(true);
            try {
                const result = await fetchMetaViewerMap(
                    token,
                    selectedFile,
                    props.mapType
                );

                return {
                    url: result.url,
                    size: result.size,
                    version: version,
                };
            } catch (error) {
                console.error('Upload error:', error);
                throw error;
            } finally {
                setIsUploading(false);
            }
        }, [selectedFile, props.mapType]);

        const hasFile = useCallback(() => {
            return selectedFile !== null;
        }, [selectedFile]);

        const clear = useCallback(() => {
            setSelectedFile(null);
            setFileName('');
        }, []);

        useImperativeHandle(ref, () => ({
            uploadMap,
            hasFile,
            clear,
        }), [uploadMap, hasFile, clear]);

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                setSelectedFile(file);
                setFileName(file.name);
            }
        };

        const handleRemoveFile = () => {
            setSelectedFile(null);
            setFileName('');
            // input 초기화
            const input = document.getElementById(props.displayId) as HTMLInputElement;
            if (input) input.value = '';
        };

        return (
            <div>
                <FlexRow style={{ gap: 20, alignItems: 'center' }}>
                    <input
                        type="file"
                        id={props.displayId}
                        accept=".glb,.gltf"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    <label htmlFor={props.displayId} style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}>
                        <FlexCenter
                            style={{
                                width: 200,
                                height: 80,
                                borderRadius: 10,
                                backgroundColor: '#0003',
                                position: 'relative',
                                border: '2px dashed #999',
                            }}>
                            <div
                                style={{
                                    color: 'gray',
                                    textAlign: 'center',
                                    padding: 10,
                                }}>
                                <div style={{ fontSize: '2rem', marginBottom: 5 }}>
                                    {isUploading ? '⏳' : '📁'}
                                </div>
                                <span style={{ fontSize: '0.9rem' }}>
                                    {isUploading ? '업로드 중...' : `${props.label} 선택`}
                                </span>
                            </div>
                        </FlexCenter>
                    </label>

                    {selectedFile && (
                        <div style={{ 
                            flex: 1, 
                            padding: '10px 15px', 
                            backgroundColor: '#f0f0f0', 
                            borderRadius: 8,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: 5 }}>{fileName}</div>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                    크기: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                            </div>
                            <StyledButton
                                onClick={() => {
                                    if (isUploading) return;
                                    handleRemoveFile();
                                }}
                                style={{
                                    background: '#f44336',
                                    margin: 0,
                                    padding: '5px 15px',
                                    minHeight: 'auto',
                                    height: 'auto',
                                    cursor: isUploading ? 'not-allowed' : 'pointer',
                                    opacity: isUploading ? 0.5 : 1,
                                }}
                                >
                                제거
                            </StyledButton>
                        </div>
                    )}
                </FlexRow>
            </div>
        );
    }
);

export default MapFileUploadComponent;

