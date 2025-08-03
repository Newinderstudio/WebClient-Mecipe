import { useTypedSelector } from "@/store";
import { useEffect } from "react";
import { useState } from "react";

interface hookMember {
    token: string | undefined;
}

export default function useExampleImageScreen(): hookMember {
    const _token = useTypedSelector((state) => state.account?.accessToken ?? undefined);

    const [token, setToken] = useState<string | undefined>(_token);

    useEffect(() => {
        setToken(_token);
    }, [_token]);

    return {
        token,
    }
}