'use client'

import { CafeVirtualLinkPrimitiveResult, CafeVirtualLinkResult, CafeVirtualLinkThumbnailImageCreateInput, CafeVirtualLinkThumbnailImagePrimitiveResult, CreateCafeVirtualLinkWithImageListDto } from "@/api/cafeVirtualLinksApi";
import { Flex, FlexCenter, FlexRow } from "@/common/styledComponents";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import VirtualLinkCard, { CafeVirtualLinkDataProp } from "./VirtualLinkCard";
import { imageResizer } from "@/common/image/imageResizer";
import fetchImage, { getFileSize, getImageSize } from "@/util/fetchImage";
import VirtualLinkInput, { VirtualLinkInputData } from "./VirtualLinkInput";
import { StyledButton } from "@/common/styledAdmin";
import Image from "next/image";

interface WrittingImage {
    file: File,
    CafeVirtualLinkThumbnailImage: CafeVirtualLinkThumbnailImageCreateInput
}

interface Props {
    datas?: CafeVirtualLinkResult[],
    onUpdateImage?: (token: string, thumbanilId: number) => Promise<CafeVirtualLinkThumbnailImagePrimitiveResult>,
    onUpdateInput?: (linkId: number) => Promise<CafeVirtualLinkPrimitiveResult>,
    token?: string
    // onClickRegister: (link: CafeVirtualLinkCreateInput,
    //     thumbnailImage: CafeVirtualLinkThumbnailImageCreateInput) => void;
}

export interface VirtualLinkUploadComponentHandler {
    getLinkData: (token: string) => Promise<CreateCafeVirtualLinkWithImageListDto>
}


const VirtualLinkUploadComponent = forwardRef<VirtualLinkUploadComponentHandler, Props>(function VirtualLinkUploadComponent(props: Props, ref) {

    const [writtingImageData, setWritingImageData] = useState<WrittingImage>();
    const [writtingInputData, setWritingInputData] = useState<VirtualLinkInputData>();

    const [linkDataList, setLinkDataList] = useState<CafeVirtualLinkDataProp[]>([]);

    useEffect(() => {
        console.log("링크데이터: ", linkDataList);
    }, [linkDataList])

    useEffect(() => {
        const initionalData = props.datas?.filter(data => data.CafeVirtualLinkThumbnailImage != undefined) ?? [];
        setLinkDataList(initionalData);
    }, [props.datas])

    const onChangeWrittenImage = async (files: File[]) => {
        if (files.length > 0) {
            const targetFile = files[0];

            const result = await getCafeVirtualLinkThumbnailImage(targetFile);

            if (result) {
                setWritingImageData({
                    file: result.compressedFile,
                    CafeVirtualLinkThumbnailImage: result.compressedFileData
                })
            }


        }
    }

    const getCafeVirtualLinkThumbnailImage = async (file: File) => {
        const compressedFile = await imageResizer(file, { maxSizeMB: 1, maxWidthOrHeight: 320 });
        if (!compressedFile) return;

        const size = getFileSize(compressedFile);
        const { width, height } = await getImageSize(compressedFile);

        return {
            compressedFile,
            compressedFileData: {
                url: URL.createObjectURL(compressedFile),
                width,
                height,
                size
            }
        }

    }

    const onClickAddLinkByInput = (inputData: VirtualLinkInputData) => {
        if (!writtingImageData) {
            alert("썸네일 이미지를 업데이트하세요");
            return;
        }

        if (linkDataList.find(data => data.type === inputData.type)) {
            alert("겹치는 타입의 링크가 있습니다.");
            return;
        }

        setWritingInputData({
            name: '',
            type: '',
            url: '',
            isAvaliable: true
        });
        setWritingImageData(undefined);

        setLinkDataList(prev => {
            return [
                {
                    file: writtingImageData.file,
                    CafeVirtualLinkThumbnailImage: writtingImageData.CafeVirtualLinkThumbnailImage,
                    ...inputData,
                    isDisable: false
                },
                ...prev
            ]
        });

    }

    const getLinkData = useCallback(async (token: string): Promise<CreateCafeVirtualLinkWithImageListDto> => {
        interface CreatePreviewData extends Omit<CafeVirtualLinkPrimitiveResult, "cafeInfoId" | "id" | "createdAt"> {
            CafeVirtualLinkThumbnailImage: {
                imageFile: File
                width: number,
                height: number,
                size: number
            }
        }
        const prevDataList: CreatePreviewData[] = (await Promise.all(linkDataList.map(async (data) => {
            if (data.isDisable == true) return undefined;
            if (!data.file) return undefined;
            const result = await getCafeVirtualLinkThumbnailImage(data.file);
            if (!result) return undefined;
            const { compressedFile, compressedFileData } = result;
            const size = getFileSize(data.file!);
            return {
                name: data.name,
                type: data.type,
                url: data.url,
                isDisable: data.isDisable,
                isAvaliable: data.isAvaliable,
                CafeVirtualLinkThumbnailImage: {
                    imageFile: compressedFile,
                    width: compressedFileData.width,
                    height: compressedFileData.height,
                    size: size
                }
            }
        }))).filter(data => data !== undefined);

        const form = new FormData();
        prevDataList.forEach(data => {
            form.append("images", data.CafeVirtualLinkThumbnailImage.imageFile);
        })
        const imageResults = await fetchImage(token, form);

        return {
            create: prevDataList.map((data, index) => ({
                link: {
                    name: data.name,
                    type: data.type,
                    url: data.url,
                    isAvaliable: data.isAvaliable,
                },
                thumbnailImage: {
                    url: imageResults[index].url,
                    width: data.CafeVirtualLinkThumbnailImage.width,
                    height: data.CafeVirtualLinkThumbnailImage.height,
                    size: data.CafeVirtualLinkThumbnailImage.size,
                }
            }))
        }
    }, [linkDataList])

    useImperativeHandle(ref, () => ({
        getLinkData: getLinkData,
        // 추가 메서드...
    }), [getLinkData]);

    const onChangeDisableLinkData = async (data: CafeVirtualLinkDataProp, index: number) => {
        let finalData: CafeVirtualLinkDataProp = data;
        if (data.id && data.CafeVirtualLinkThumbnailImage?.id && props.onUpdateImage && props.onUpdateInput) {
            try {
                finalData = {
                    ...finalData,
                    ...(await props.onUpdateInput(data.id))
                }
            } catch (e) {
                alert(e);
            }
        }

        setLinkDataList(prev => {
            prev[index] = finalData;
            return [...prev]
        });
    }

    const onChangeLinkData = async (data: CafeVirtualLinkDataProp, index: number) => {
        let finalData: CafeVirtualLinkDataProp = data;
        if (data.id && data.CafeVirtualLinkThumbnailImage?.id && props.onUpdateImage && props.onUpdateInput && props.token) {
            if (data.file) {
                try {
                    const result = await getCafeVirtualLinkThumbnailImage(data.file);
                    if (result) {
                        const form = new FormData();
                        form.append("images", data.file);
                        const imageResults = await fetchImage(props.token, form);

                        if (imageResults.length > 0) {
                            finalData.file = undefined;
                            finalData.CafeVirtualLinkThumbnailImage = await props.onUpdateImage(props.token, data.CafeVirtualLinkThumbnailImage.id);
                        }
                    }
                } catch (e) {
                    alert(e);
                }
            } else {
                try {
                    finalData = {
                        ...finalData,
                        ...(await props.onUpdateInput(data.id))
                    }
                } catch (e) {
                    alert(e);
                }
            }
        }

        setLinkDataList(prev => {
            prev[index] = finalData;
            return [...prev]
        });
    }

    return (
        <div>
            <FlexRow>
                <Flex
                    style={{
                        width: 200,
                        height: 'auto'
                    }}
                >
                    <FlexRow>
                        <input
                            type="file"
                            id="virtualLinkImage"
                            accept='image/*'
                            multiple
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                const files = Array.from(e.target.files ?? []);
                                onChangeWrittenImage(files);
                            }}
                        />
                        <label htmlFor="virtualLinkImage" style={{ flex: 1 }}>
                            {
                                writtingImageData?.CafeVirtualLinkThumbnailImage.url ?
                                    <FlexCenter
                                        style={{
                                            width: 200,
                                            height: 200,
                                            borderRadius: 10,
                                            position: 'relative'
                                        }}
                                    >
                                        <Image
                                            src={writtingImageData.CafeVirtualLinkThumbnailImage.url}
                                            alt={"업로드 이미지"}
                                            layout="fill"
                                            objectFit="cover"
                                        />
                                    </FlexCenter>

                                    : <div
                                        style={{
                                            width: 200,
                                            height: 200,
                                            borderRadius: 10,
                                            cursor: 'pointer',
                                            backgroundColor: '#0003',
                                            position: 'relative'
                                        }}>
                                        <FlexCenter
                                            style={{
                                                display: 'display',
                                                color: 'gray',
                                                height: '100%'
                                            }}>
                                            <span>이미지를 업로드해주세요</span>
                                        </FlexCenter>
                                    </div>
                            }
                            <StyledButton
                                style={{
                                    width: '100%',
                                    background: '#4A5864',
                                    margin: 0,
                                    textAlign: 'center',
                                    marginTop: 5
                                }}
                            >
                                이미지 첨부하기
                            </StyledButton>
                        </label>
                    </FlexRow>
                    <VirtualLinkInput
                        onClickRegister={onClickAddLinkByInput}
                        data={writtingInputData}
                    />
                </Flex>
                <FlexRow
                    style={{ backgroundColor: '#f5f5f5', overflowX: 'scroll', flexGrow: 1, marginLeft: 20 }}
                >
                    <FlexRow
                        style={{
                            width: 'auto',
                            gap: 5
                        }}
                    >
                        {
                            linkDataList.map((propData, index) => {
                                return (
                                    <VirtualLinkCard
                                        data={propData}
                                        key={index}
                                        onChangeData={(data) => {
                                            onChangeLinkData(data, index);
                                        }}
                                        onClickImage={() => {
                                            linkDataList[index].isDisable = !linkDataList[index].isDisable;
                                            onChangeDisableLinkData(linkDataList[index], index);
                                        }}
                                        imageWidth={200}
                                    />
                                )
                            })
                        }
                    </FlexRow>

                </FlexRow>

            </FlexRow>

        </div >

    )
})
export default VirtualLinkUploadComponent;