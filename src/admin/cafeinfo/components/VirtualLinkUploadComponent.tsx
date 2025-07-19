'use client'

import { CafeVirtualLinkPrimitiveResult, CafeVirtualLinkResult, CafeVirtualLinkThumbnailImageCreateInput, CreateCafeVirtualLinkWithImageListDto, useCreateCafeVirtualLinkByAdminMutation, useUpdateCafeVirtualLinkByAdminMutation, useUpdateCafeVirtualLinkThumbnailImageByAdminMutation } from "@/api/cafeVirtualLinksApi";
import { Flex, FlexCenter, FlexRow } from "@/common/styledComponents";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import VirtualLinkCard, { CafeVirtualLinkDataProp } from "./VirtualLinkCard";
import { imageResizer } from "@/common/image/imageResizer";
import fetchImage, { getFileSize, getImageSize, getServerImage } from "@/util/fetchImage";
import VirtualLinkInput, { VirtualLinkInputData } from "./VirtualLinkInput";
import { StyledButton } from "@/common/styledAdmin";
import Image from "next/image";

interface WrittingImage {
    file: File,
    CafeVirtualLinkThumbnailImage: CafeVirtualLinkThumbnailImageCreateInput
}

interface CreateRawLinkData extends Omit<CafeVirtualLinkPrimitiveResult, "cafeInfoId" | "id" | "createdAt"> {
    CafeVirtualLinkThumbnailImage: {
        imageFile: File
        width: number,
        height: number,
        size: number
    }
}

interface Props {
    datas?: CafeVirtualLinkResult[],
    // onUpdateImage?: (token: string, thumbanilId: number) => Promise<CafeVirtualLinkThumbnailImagePrimitiveResult>,
    // onUpdateInput?: (linkId: number) => Promise<CafeVirtualLinkPrimitiveResult>,
    token?: string,
    cafeId?:number
    // onClickRegister: (link: CafeVirtualLinkCreateInput,
    //     thumbnailImage: CafeVirtualLinkThumbnailImageCreateInput) => void;
}

export interface VirtualLinkUploadComponentHandler {
    getLinkDataList: (token: string) => Promise<CreateCafeVirtualLinkWithImageListDto>
}


const VirtualLinkUploadComponent = forwardRef<VirtualLinkUploadComponentHandler, Props>(function VirtualLinkUploadComponent(props: Props, ref) {

    const [writtingImageData, setWritingImageData] = useState<WrittingImage>();
    const [writtingInputData, setWritingInputData] = useState<VirtualLinkInputData>();

    const [linkDataList, setLinkDataList] = useState<CafeVirtualLinkDataProp[]>([]);

    const [updateVirtualLink] = useUpdateCafeVirtualLinkByAdminMutation();
    const [updateVirtualLinkThumbnailImage] = useUpdateCafeVirtualLinkThumbnailImageByAdminMutation();
    const [createVirtualLink] = useCreateCafeVirtualLinkByAdminMutation();

    useEffect(() => {
        console.log("링크데이터: ", linkDataList);
    }, [linkDataList])

    useEffect(() => {
        if (props.datas) {
            const initialData = props.datas.filter(data => data.CafeVirtualLinkThumbnailImage != undefined);
            setLinkDataList(initialData.map(data => ({
                ...data,
                CafeVirtualLinkThumbnailImage: {
                    ...data.CafeVirtualLinkThumbnailImage!, // Add non-null assertion here
                    url: getServerImage(data.CafeVirtualLinkThumbnailImage!.url)
                }
            })));

            const cafeIdCandidates = new Set(props.datas.map(data => data.cafeInfoId) ?? []);
            if (cafeIdCandidates.size > 1) {
                alert("[가상 링크 업로드] 잘못된 데이터가 포함되었습니다.");
            }
        }
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

    const onClickAddLinkByInput = async (inputData: VirtualLinkInputData) => {
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

        let newLinkDataList: CafeVirtualLinkDataProp[];
        if (props.token && props.cafeId) {
            try {
                const result = await getCafeVirtualLinkThumbnailImage(writtingImageData.file);

                if (!result) throw new Error("이미지 변환 실패");

                const form = new FormData();
                form.append("image", result.compressedFile);
                const imageResults = await fetchImage(props.token, form, "virtuallinkimage");

                if (imageResults.length === 0) throw new Error("이미지 업로드 실패");

                const imageResult = imageResults[0];


                const resultData = await createVirtualLink({
                    body: {
                        link: {
                            name: inputData.name,
                            type: inputData.type,
                            url: inputData.url,
                            isAvaliable: inputData.isAvaliable
                        },
                        thumbnailImage: {
                            url: getServerImage(imageResult.url),
                            width: result.compressedFileData.width,
                            height: result.compressedFileData.height,
                            size: result.compressedFileData.size
                        }
                    },
                    cafeId: props.cafeId
                }).unwrap();

                newLinkDataList = [
                    {
                        ...resultData,
                        isDisable: false
                    },
                    ...linkDataList
                ];


            } catch (e) {
                newLinkDataList = linkDataList;
                alert(e);
            }

        } else {
            newLinkDataList = [
                {
                    file: writtingImageData.file,
                    CafeVirtualLinkThumbnailImage: writtingImageData.CafeVirtualLinkThumbnailImage,
                    ...inputData,
                    isDisable: false
                },
                ...linkDataList
            ]
        }

        setLinkDataList(newLinkDataList);

    }

    const getLinkDataList = useCallback(async (token: string): Promise<CreateCafeVirtualLinkWithImageListDto> => {
        if (linkDataList.length === 0) return ({
            create: []
        })

        const rawDataList: CreateRawLinkData[] = (await Promise.all(linkDataList.map(async (data) => {
            if (data.isDisable === true) return undefined;
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
        rawDataList.forEach(data => {
            form.append("image", data.CafeVirtualLinkThumbnailImage.imageFile);
        })
        const imageResults = await fetchImage(token, form, "virtuallinkimage");

        return {
            create: rawDataList.map((data, index) => ({
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
        getLinkDataList: getLinkDataList,
        // 추가 메서드...
    }), [getLinkDataList]);

    const onChangeDisableLinkData = async (data: CafeVirtualLinkDataProp, index: number) => {
        let finalData: CafeVirtualLinkDataProp = data;
        let targetIndex = index;
        if (data.id && data.CafeVirtualLinkThumbnailImage?.id && props.token) {
            try {
                finalData = await updateVirtualLink({
                    id: data.id,
                    body: {
                        isDisable: data.isDisable
                    }
                }).unwrap();

                targetIndex = linkDataList.findIndex(data => data.id === finalData.id);

            } catch (e) {
                alert(e);
            }
        }

        setLinkDataList(prev => {
            prev[targetIndex] = finalData;
            return [...prev]
        });
    }

    const onChangeLinkData = async (data: CafeVirtualLinkDataProp, index: number) => {
        let finalData: CafeVirtualLinkDataProp = data;
        if (data.id && data.CafeVirtualLinkThumbnailImage?.id && props.token) {
            try {
                if (data.file) {
                    try {
                        const result = await getCafeVirtualLinkThumbnailImage(data.file);
                        if (!result) throw new Error("이미지 변환 실패");
                        const form = new FormData();
                        form.append("image", data.file);
                        const imageResults = await fetchImage(props.token, form, "virtuallinkimage");

                        if (imageResults.length === 0) throw new Error("이미지 업로드 실패");

                        const imageResult = imageResults[0];
                        finalData.file = undefined;
                        finalData.CafeVirtualLinkThumbnailImage = await updateVirtualLinkThumbnailImage({
                            imageId: data.CafeVirtualLinkThumbnailImage.id,
                            body: {
                                url: imageResult.url,
                                width: data.CafeVirtualLinkThumbnailImage.width,
                                height: data.CafeVirtualLinkThumbnailImage.height,
                                size: data.CafeVirtualLinkThumbnailImage.size
                            }
                        }).unwrap();

                        finalData.CafeVirtualLinkThumbnailImage.url = getServerImage(finalData.CafeVirtualLinkThumbnailImage.url);

                    } catch (e) {
                        throw (e);
                    }
                } else {
                    try {
                        finalData = await updateVirtualLink({
                            id: data.id,
                            body: {
                                name: data.name,
                                type: data.type,
                                url: data.url,
                                isAvaliable: data.isAvaliable
                            }
                        }).unwrap();
                    } catch (e) {
                        throw (e);
                    }
                }

                const findIndex = linkDataList.findIndex(data => data.id === finalData.id);
                if (findIndex !== -1) {
                    linkDataList[findIndex] = finalData;
                    setLinkDataList([...linkDataList]);
                }

            } catch (e) {
                alert(e);
            }

        } else {
            setLinkDataList(prev => {
                prev[index] = finalData;
                return [...prev]
            });
        }

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