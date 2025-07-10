interface hookMember {
    onClickHistoryBack: () => void;
}

export function useMainHeader(): hookMember {

    const onClickHistoryBack = () => {
        window.history.back();
    }

    return {
        onClickHistoryBack
    }
};