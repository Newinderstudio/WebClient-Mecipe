'use client'

import { InputStyle, StyledButton } from "@/common/styledAdmin";
import { Flex } from "@/common/styledComponents";
import { fenxyBlue } from "@/util/constants/style";
import { useEffect, useState } from "react";

export type VirtualLinkInputData = {
    name: string;
    url: string;
    type: string;
    isAvaliable: boolean;
}

interface Props {
    data?: VirtualLinkInputData,
    buttonText?: string,
    isDisable?: boolean,
    onClickRegister: (data: VirtualLinkInputData) => void;
}

const VirtualLinkInput = (props: Props) => {

    const [inputData, setInputData] = useState<VirtualLinkInputData>(props.data ?? {
        name: '',
        url: '',
        type: '',
        isAvaliable: true
    });

    const [isModified, setIsModified] = useState<boolean>(false);

    useEffect(()=>{
        setIsModified(
            props.data?.isAvaliable != inputData.isAvaliable
            || props.data?.name != inputData.name
            || props.data?.type != inputData.type
            || props.data?.url != inputData.url
        )
    },[inputData, props.data])

    useEffect(() => {
        if (props.data) setInputData(props.data);
    }, [props.data])

    return (
        <Flex style={{ gap: 5 }}>
            <Flex>
                <div>이름</div>
                <InputStyle
                    style={{ flexGrow: 1, border: '1px solid #4A5864', borderRadius: 4 }}
                    type="text"
                    value={inputData.name}
                    disabled={props.isDisable === true}
                    onChange={(e) => {
                        setInputData({
                            ...inputData,
                            name: e.target.value.trim()
                        })
                    }}
                />
            </Flex>
            <Flex>
                <div>타입</div>
                <InputStyle
                    style={{ flexGrow: 1, border: '1px solid #4A5864', borderRadius: 4, }}
                    disabled={props.isDisable === true}
                    type="text"
                    value={inputData.type}
                    onChange={(e) => {
                        setInputData(prev => ({
                            ...prev,
                            type: e.target.value.trim()
                        }))
                    }}
                />
            </Flex>
            <Flex>
                <div>URL</div>
                <InputStyle
                    style={{ flexGrow: 1, border: '1px solid #4A5864', borderRadius: 4, color: inputData.isAvaliable ? 'black' : 'pink' }}
                    type="text"
                    value={inputData.url}
                    disabled={props.isDisable === true}
                    onChange={(e) => {
                        setInputData(prev => ({
                            ...prev,
                            url: e.target.value.trim()
                        }))
                    }}
                />
                <StyledButton
                    style={{
                        background: inputData.isAvaliable === true ? 'red' : fenxyBlue,
                        color: 'white',
                        display: 'inline-block',
                        margin: 0,
                        textAlign: 'center',
                        cursor: props.isDisable === true ? 'default' : 'pointer',
                        opacity: props.isDisable === true ? 0.5 : 1
                    }}
                    onClick={() => {
                        if (props.isDisable === true) return;
                        setInputData(prev => ({
                            ...prev,
                            isAvaliable: !inputData.isAvaliable
                        }))
                    }}
                >
                    {inputData.isAvaliable === true ? '링크 비활성화' : '링크 활성화'}
                </StyledButton>
            </Flex>
            <StyledButton
                style={{
                    background: '#4A5864',
                    color: 'white',
                    display: 'inline-block',
                    margin: 0,
                    textAlign: 'center',
                    marginTop: 5,
                    cursor: props.isDisable === true || isModified === false ? 'default' : 'pointer',
                    opacity: props.isDisable === true || isModified === false ? 0.5 : 1
                }}
                onClick={() => {
                    if (props.isDisable === true || isModified === false) return;

                    if (inputData.name === '' || inputData.type === '' || inputData.url === '') {
                        alert("링크 내용을 모두 입력해주세요.");
                        return;
                    }

                    const pattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/
                    if(!pattern.test(inputData.url)) {
                        alert("유효하지 않은 URL입니다.")
                        return;
                    }

                    props.onClickRegister(inputData);
                }}
            >
                {props?.buttonText ?? '등록하기'}
            </StyledButton>
        </Flex>
    )
}

export default VirtualLinkInput;