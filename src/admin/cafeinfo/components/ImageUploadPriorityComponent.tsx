'use clinet'

import { imageResizer } from "@/common/image/imageResizer";
import { FlexCenter, FlexRow } from "@/common/styledComponents";
import fetchImage, { getImageSize } from "@/util/fetchImage";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import ImageUploadCard from "./ImageUploadCard";
import { default as NextIamge } from 'next/image';
import { StyledButton } from "@/common/styledAdmin";

export interface ImageUploadDto {
    id?: number
    url?: string,
    thumbnailUrl?: string, //optional
    priority: number
    isDisable: boolean
}

interface ThumbnailImagePreview {
    file?: File,
    thumbnailFile?: File,
    previewUrl: string,
    id?: number,
    isDisable: boolean,
    width: number,
    height: number,
    size: number
}

interface InitialImageData {
    id: number;
    createdAt: Date | string;
    url: string;
    width: number;
    height: number;
    size: number;
    priority: number;
    isDisable: boolean;
}

interface Props {
    isThumbnail?: boolean,
    data?: InitialImageData[];
    maxWidthOrHeight?: number;
    maxSizeMB?: number;
    dispalyId: string;
    updateAction?: () => void;
}

type UpsertCafeImageListDto = {
    create: {
        priority: number;
        url: string;
        thumbnailUrl?: string;
        width: number;
        height: number;
        size: number;
        cafeInfoId: number;
    }[],
    update: {
        id: number;
        priority?: number;
        isDisable?: boolean;
    }[]
};

export interface ImageUploadPriorityComponentHandler {
    getImageData: (token: string, cafeInfoId: number) => Promise<UpsertCafeImageListDto>
}

const ImageUploadPriorityComponent = forwardRef<ImageUploadPriorityComponentHandler, Props>(function ImageUploadPriorityComponent(props: Props, ref) {

    const maxWidthOrHeight = props.maxWidthOrHeight ?? 1280;
    const maxSizeMB = props.maxSizeMB ?? 4;

    const [thumbnails, setThumbnails] = useState<ThumbnailImagePreview[]>([])

    const getImageData = useCallback(async (token: string, cafeInfoId: number): Promise<UpsertCafeImageListDto> => {
        interface CreatePreviewData {
            imageFile: File
            thumbnailFile?: File
            priority: number
            isDisable: boolean,
            width: number,
            height: number,
            size: number
        }

        interface UpdatePreviewData {
            id: number
            priority: number
            isDisable: boolean
        }

        const createThumbnails: CreatePreviewData[] = [];
        const updateThumbnails: UpdatePreviewData[] = [];

        let imageResults: {
            url: string;
            thumbnailUrl?: string;
        }[] = [];
        try {

            console.log("ImageUpload getImageData", thumbnails);

            if (thumbnails.length === 0) throw new Error("no image")

            thumbnails.forEach((data, index) => {
                if (data.id) {
                    updateThumbnails.push({
                        id: data.id,
                        priority: index,
                        isDisable: data.isDisable
                    });
                } else if (data.isDisable === false && data.file) {
                    createThumbnails.push({
                        imageFile: data.file,
                        thumbnailFile: data.thumbnailFile!,
                        priority: index,
                        isDisable: data.isDisable,
                        width: data.width,
                        height: data.height,
                        size: data.size
                    });
                }
            });

            const form = new FormData();

            if (createThumbnails.length > 0) {
                createThumbnails.forEach(data => {
                    if (data.imageFile) form.append("image", data.imageFile)
                    if (data.thumbnailFile) form.append("thumbnail", data.thumbnailFile);
                });
                imageResults = await fetchImage(token, form, props.dispalyId.toLowerCase());
            }

        } catch (e) {
            throw e;
        }

        return ({
            create: createThumbnails.map((data, index) => ({
                priority: data.priority,
                url: imageResults[index].url,
                thumbnailUrl: imageResults[index].thumbnailUrl,
                width: data.width,
                height: data.height,
                size: data.size,
                cafeInfoId: cafeInfoId
            })),
            update: updateThumbnails.map(data => ({
                id: data.id,
                priority: data.priority,
                isDisable: data.isDisable
            }))
        })


    }, [props.dispalyId, thumbnails]);

    useEffect(() => {
        if (props.data) {

            setThumbnails([...props.data].sort((a, b) => a.priority - b.priority).map(data => ({
                id: data.id,
                previewUrl: data.url,
                isDisable: data.isDisable,
                width: data.width,
                height: data.height,
                size: data.size,
            })))
        }
    }, [props.data, props.dispalyId])

    useImperativeHandle(ref, () => ({
        getImageData: getImageData,
        // 추가 메서드...
    }), [getImageData]);

    const moveUp = (index: number) => {
        if (index === 0) return
        const updated = [...thumbnails]
            ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
        setThumbnails(updated)
    }

    const moveDown = (index: number) => {
        if (index === thumbnails.length - 1) return
        const updated = [...thumbnails]
            ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
        setThumbnails(updated)
    }

    const onChangeImage = async (files: File[]) => {
        if (files.length > 0) {
            const newThumbnails: ThumbnailImagePreview[] = (await Promise.all(files.map(async (file) => {
                const compressedFile = await imageResizer(file, { maxSizeMB, maxWidthOrHeight });
                if (!compressedFile) return null;

                let thumbnailFile: File | undefined = undefined;
                if (props.isThumbnail === true) {
                    thumbnailFile = await imageResizer(file, { maxSizeMB: 1.5, maxWidthOrHeight: 720 });
                }

                const size = Math.floor(compressedFile.size / 1024);

                const { height, width } = await getImageSize(compressedFile);

                return {
                    file: compressedFile,
                    thumbnailFile: thumbnailFile,
                    previewUrl: URL.createObjectURL(compressedFile),
                    isDisable: false,
                    width,
                    height,
                    size
                };
            }))).filter((data): data is NonNullable<typeof data> => data !== null)



            setThumbnails([
                ...newThumbnails,
                ...thumbnails
            ]);
        }
    }

    return (
        <div>
            <FlexRow style={{ gap: 20, height: 'auto' }}>
                <FlexRow>
                    <input
                        type="file"
                        id={props.dispalyId}
                        accept='image/*'
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const files = Array.from(e.target.files ?? []);
                            onChangeImage(files);
                        }}
                    />
                    <label htmlFor={props.dispalyId} style={{ flex: 1 }}>
                        <FlexCenter
                            style={{
                                width: 200,
                                height: 200,
                                flex: 1,
                                borderRadius: 10,
                                cursor: 'pointer',
                                backgroundColor: '#0003',
                                position: 'relative'
                            }}>
                            <div
                                style={{
                                    position: 'absolute',
                                    display: 'display',
                                    color: 'gray'
                                }}>
                                <div
                                    style={{
                                        justifySelf: 'center',
                                        fontSize: '5rem'
                                    }}
                                >+</div>
                                <span>이미지 첨부하기</span>
                            </div>
                        </FlexCenter>
                    </label>
                </FlexRow>
                <FlexRow
                    style={{ backgroundColor: '#f5f5f5', overflowX: 'scroll', flexGrow: 1 }}
                >
                    <FlexRow
                        style={{
                            width: 'auto',
                            gap: 10
                        }}
                    >
                        {
                            thumbnails.map((thumb, index) => (
                                <div key={index} style={{ display: 'block', alignItems: 'center' }}>
                                    <ImageUploadCard
                                        src={thumb.previewUrl}
                                        alt={`thumb-${index}`}
                                        isDisable={thumb.isDisable}
                                        onClick={() => {
                                            const updated = [...thumbnails]
                                            updated[index].isDisable = !updated[index].isDisable
                                            setThumbnails(updated)
                                        }}
                                        style={{
                                            height: 200,
                                            width: 200 * thumb.width / thumb.height
                                        }}
                                    />
                                    <div style={{
                                        width: '100%',
                                    }}>
                                        <FlexRow
                                            style={{
                                                width: '100%',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <ArrwoButton left onClick={() => moveUp(index)} />
                                            <ArrwoButton onClick={() => moveDown(index)} />
                                        </FlexRow>

                                        <div
                                            style={{
                                                textAlign: 'center'
                                            }}
                                        >우선순위: {index}</div>
                                    </div>

                                </div>
                            ))

                        }
                    </FlexRow>

                </FlexRow>
            </FlexRow>
            {
                props.updateAction != undefined ? <StyledButton
                    style={{ background: '#4A5864', margin: 0, marginTop: 10, display: 'inline-block' }}
                    onClick={() => { if (props.updateAction) props.updateAction() }}
                >
                    이미지 변경사항 적용
                </StyledButton>
                    : undefined
            }
        </div>

    )
});
export default ImageUploadPriorityComponent;

const ArrwoButton = ({
    onClick,
    left
}: {
    onClick: () => void,
    left?: boolean
}) => (<div
    onClick={onClick}
    style={{
        transform: left ? 'rotate(90deg)' : 'rotate(-90deg)',
        height: 32,
        width: 32,
        position: 'relative',
        cursor: 'pointer',
    }}>
    <NextIamge
        src="/image/admin/icon/arrow-down-gray-500.svg"
        layout="fill"
        alt="arrow"
    />
</div>)