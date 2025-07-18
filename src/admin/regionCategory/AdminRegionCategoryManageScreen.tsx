'use client'

import { Flex, FlexRow } from "@/common/styledComponents";
import useAdminRegionCategoryManageScreen from "./hooks/useAdminRegionCategoryManageScreen"
import { BorderRoundedContent } from "@/common/styledAdmin";
import RegionCategoryEditor from "@/admin/regionCategory/components/RegionCategoryEditor";
import RegionCategorySelector from "./components/RegionCategorySelector";

const AdminRegionCategoryManageScreen = () => {
    const hookMember = useAdminRegionCategoryManageScreen();

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
                        지역카테고리관리
                    </div>
                </FlexRow>
                <BorderRoundedContent style={{ padding: 30 }}>
                    <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                        {/* {hookMember.userType === 'GENERAL' && (
              <> */}
                        <Flex style={{ width: 'calc(100% - 15px)' }}>
                            <RegionCategoryEditor
                                parentCandidates={hookMember.parentCandidates}
                                getCategories={hookMember.getCategories}
                            />
                        </Flex>
                        <Flex style={{ width: 'calc(100% - 15px)' }}>
                            <RegionCategorySelector
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

export default AdminRegionCategoryManageScreen;