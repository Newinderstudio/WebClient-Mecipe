'use client'

import { Flex, FlexRow } from "@/common/styledComponents";
import { BorderRoundedContent } from "@/common/styledAdmin";
import useAdminProductCategoryManagerScreen from "./hooks/useAdminProductCategoryManagerScreen";
import ProductCategoryEditor from "./components/ProductCategoryEditor";
import ProductCategorySelector from "./components/ProductCategorySelector";

const AdminProductCategoryManageScreen = () => {
    const hookMember = useAdminProductCategoryManagerScreen();

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', width: '100%' }}>
            <div style={{ marginLeft: 240, padding: 20, minWidth: 1100 }}>
                <FlexRow
                    style={{
                        paddingBottom: 20,
                        alignItems: 'center',
                        borderBottom: '2px solid #4A5864',
                    }}>
                    <div
                        style={{
                            fontSize: 18,
                            color: '#333',
                            fontWeight: 'bold',
                            flexGrow: 1,
                            lineHeight: '32px',
                        }}>
                        상품카테고리관리
                    </div>
                </FlexRow>
                <BorderRoundedContent style={{ padding: 30 }}>
                    <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                        {/* {hookMember.userType === 'GENERAL' && (
              <> */}
                        <Flex style={{ width: 'calc(100% - 15px)' }}>
                            <ProductCategoryEditor
                                parentCandidates={hookMember.parentCandidates}
                                getCategories={hookMember.getCategories}
                            />
                        </Flex>
                        <Flex style={{ width: 'calc(100% - 15px)' }}>
                            <ProductCategorySelector
                                ref={hookMember.selectorRef}
                                onDepthCategorySelect={hookMember.setParentCategories}
                            />
                        </Flex>


                    </Flex>
                </BorderRoundedContent>
            </div>
        </div>
    )
}

export default AdminProductCategoryManageScreen;