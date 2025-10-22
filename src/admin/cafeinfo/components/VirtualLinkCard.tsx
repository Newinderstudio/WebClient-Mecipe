'use client'

import { Flex, FlexRow } from "@/common/styledComponents"
import ImageUploadCard from "./ImageUploadCard";
import { StyledButton } from "@/common/styledAdmin";
import { useEffect, useState } from "react";
import { fenxyBlue } from "@/util/constants/style";
import { getFileSize, getImageSize } from "@/util/fetchImage";
import { imageResizer } from "@/common/image/imageResizer";
import { CafeVirtualLinkPrimitiveResult, CafeVirtualLinkThumbnailImageCreateInput } from "@/api/cafeVirtualLinksApi";
import VirtualLinkInput, { VirtualLinkInputData } from "./VirtualLinkInput";

export type CafeVirtualLinkDataProp = Omit<CafeVirtualLinkPrimitiveResult, 'id' | 'createdAt' | 'cafeInfoId'> & { id?: number } & { CafeVirtualLinkThumbnailImage?: CafeVirtualLinkThumbnailImageCreateInput & { id?: number } } & { file?: File }

interface Props {
    onClickImage: () => void;
    imageWidth: number;
    data: CafeVirtualLinkDataProp
    onChangeData: (data: CafeVirtualLinkDataProp) => void;
}

const VirtualLinkCard = (props: Props) => {

    const [cardData, setCardData] = useState<CafeVirtualLinkDataProp>(props.data);

    useEffect(() => {
        setCardData(props.data);
    }, [props.data])

    const onClickChangeImage = async (files: File[]) => {
        if (files.length > 0) {
            const file = files[0];

            const compressedFile = await imageResizer(file, { maxSizeMB: 1, maxWidthOrHeight: 320 });
            if (!compressedFile) return;

            const size = getFileSize(compressedFile);
            const { width, height } = await getImageSize(compressedFile);
            props.onChangeData({
                ...cardData,
                file: compressedFile,
                CafeVirtualLinkThumbnailImage: {
                    url: URL.createObjectURL(compressedFile),
                    width,
                    height,
                    size
                }
            })
        }
    }

    const onClickChangeInput = (data: VirtualLinkInputData) => {
        props.onChangeData({
            ...cardData,
            name: data.name,
            type: data.type,
            url: data.url,
            isAvaliable: data.isAvaliable
        });
    }

    return (
        <Flex>
            {
                cardData.CafeVirtualLinkThumbnailImage?.url ?
                    <ImageUploadCard
                        onClick={props.onClickImage}
                        src={cardData.CafeVirtualLinkThumbnailImage.url}
                        alt={cardData.type}
                        isDisable={cardData.isDisable}
                        style={{
                            width: props.imageWidth,
                            height: props.imageWidth
                        }}
                    /> : undefined
            }

            <FlexRow>
                <input
                    type="file"
                    id={"virtualImage" + cardData.type}
                    accept='image/*'
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        if(cardData.isDisable === true) return;
                        const files = Array.from(e.target.files ?? []);
                        onClickChangeImage(files);
                    }}
                    disabled={cardData.isDisable === true}
                />
                <label htmlFor={"virtualImage" + cardData.type} style={{ flex: 1 }}>
                    <StyledButton
                        style={{
                            width: '100%',
                            background: fenxyBlue,
                            textAlign: 'center',
                            margin: '5px 0 0 0',
                            cursor: cardData.isDisable === true ? 'default' : 'pointer',
                            opacity: cardData.isDisable === true ? 0.5 : 1
                        }}
                    >
                        이미지 업로드
                    </StyledButton>
                </label>
            </FlexRow>
            <Flex>
                <VirtualLinkInput
                    data={cardData}
                    onClickRegister={onClickChangeInput}
                    buttonText="수정하기"
                    isDisable={cardData.isDisable}
                />
            </Flex>

        </Flex>
    )
}

export default VirtualLinkCard;