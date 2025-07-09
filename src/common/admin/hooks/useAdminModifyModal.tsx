import { useEffect, useState } from "react";

interface hookMember {
    data: Map<string, number|string>;
    onChangeData: (key:string, value: number|string) => void;
    confirmOriginalData: () => void;
}

export function useAdminModifyModal({
    originalData,
    setModifyData
}: {
    originalData: Map<string,  number|string>;
    setModifyData: (data: Map<string, number|string>)=>void;
}): hookMember {

    const [data, setData] = useState<Map<string, number|string>>(new Map());

    useEffect(() => {
        setData(new Map(originalData));
    }, [originalData]);

    const onChangeData = (key:string, value: number|string) => {
        setData((prev) => new Map(prev).set(key, value));
    }

    const confirmOriginalData = () => {
        setModifyData(data);
    }

    return {
        data,
        onChangeData,
        confirmOriginalData
    }
}