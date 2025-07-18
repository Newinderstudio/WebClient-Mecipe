'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import {
  GovermentTypeLabel,
  //   useFindChildRegionCategoriesByAdminMutation,
  RegionCategoryResult,
  RegionCategoryTreeTable,
  useFindChildRegionCategoriesByAdminMutation,
} from '@/api/regionCategoriesApi'
import { fenxyBlue } from '@/util/constants/style';
import { Flex, FlexRow } from '@/common/styledComponents';
import { TheadSmall } from '@/common/styledAdmin';
import styled from '@emotion/styled';

const BtnCheckBoxStyle = styled.div({
  width: '100%',
  marginLeft: -1,
  lineHeight: '36px',
  border: '1px solid #eee',
  display: 'inline-flex',
  justifyContent: 'center',
  color: '#999',
  cursor: 'pointer',
  '&.active': {
    background: fenxyBlue,
    borderColor: fenxyBlue,
    color: 'white',
  },
});

interface Props {
  onDepthCategorySelect: (categories: RegionCategoryResult[], targetId?: number) => void;
}

export interface RegionCategorySelectorHandler {
  updateCategories: (data: RegionCategoryTreeTable) => void
}

// ✅ RegionCategorySelector
const RegionCategorySelector = forwardRef<RegionCategorySelectorHandler, Props>(function RegionCategorySelector({ onDepthCategorySelect }: Props, ref) {
  const [findChildren] = useFindChildRegionCategoriesByAdminMutation()

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [categoryLevels, setCategoryLevels] = useState<RegionCategoryResult[][]>([])

  const [selectDepth, setSelectDepth] = useState<number>(0);

  const getRootCategory = useCallback(async () => {
    if (categoryLevels.length > 0) return;
    try {
      const root = await findChildren({ parentId: undefined }).unwrap();
      setCategoryLevels([root]);
    } catch (e) {
      console.log(e);
    }

  }, [categoryLevels, findChildren])

  // 초기 루트 카테고리 설정
  useEffect(() => {
    getRootCategory();
  }, [getRootCategory])

  const updateCategories = useCallback(
    (data: RegionCategoryTreeTable) => {

      const { categories, closure } = data;

      const newCategories: RegionCategoryResult[][] = [];

      for (let depth = 0; depth < selectedIds.length + 1; depth++) {
        const parentId = selectedIds[depth - 1] ?? 0;

        let childCategories: RegionCategoryResult[] = [];
        if (parentId === 0) {
          const topLevelAncestors = closure.filter(data => data.depth === 1);
          const topLevelIds = new Set(topLevelAncestors.map(rel => rel.descendant));
          const roots = categories.filter(cat => !topLevelIds.has(cat.id));

          childCategories = roots;
        } else {
          const secondClosure = closure.filter(data => data.depth === 1 && data.ancestor === parentId);
          const secondLevelIds = new Set(secondClosure.map(rel => rel.descendant));
          const secondLevelCategories = categories.filter(cat => secondLevelIds.has(cat.id));

          childCategories = secondLevelCategories;
        }
        newCategories.push(childCategories);
        if (childCategories.length === 0) break;

      }

      setCategoryLevels(newCategories)

      const newDepth = Math.min(selectDepth, newCategories.length - 1)
      const newSelectedIds = selectedIds.slice(0, newCategories.length)
      setSelectDepth(newDepth)
      setSelectedIds(newSelectedIds);

      console.log("upload", newCategories, newSelectedIds, newDepth)

      onDepthCategorySelect(newCategories[newDepth - 1] ?? [], newSelectedIds[newDepth - 1] ?? undefined);
    },
    [onDepthCategorySelect, selectDepth, selectedIds]
  )


  useImperativeHandle(ref, () => ({
    updateCategories: updateCategories,
    // 추가 메서드...
  }), [updateCategories]);

  const handleSelect = async (level: number, selectedId: number) => {

    const newSelectedIds = [...selectedIds.slice(0, level), selectedId]
    setSelectedIds(newSelectedIds)

    try {
      const children = await findChildren({ parentId: selectedId }).unwrap()
      let newCategoryLevels: RegionCategoryResult[][];

      if (newSelectedIds[newSelectedIds.length - 1] > 0) {
        newCategoryLevels = [...categoryLevels.slice(0, level + 1), children];

      } else {
        newCategoryLevels = [...categoryLevels.slice(0, level + 1)];
      }
      setCategoryLevels(newCategoryLevels);

      let targetLevel: number = selectDepth;
      if (selectDepth > level) {
        if (selectedId === 0) targetLevel = level;
        else targetLevel = level + 1;
      }

      if (selectDepth !== targetLevel) {
        setSelectDepth(targetLevel);
      }

      onDepthCategorySelect(newCategoryLevels[targetLevel - 1] ?? [], newSelectedIds[targetLevel - 1] ?? undefined);


    } catch (err) {
      console.error('자식 카테고리 요청 실패:', err)
    }

  }

  const onClickDepth = (level: number) => {
    console.log('ChangeDepth', level);
    onDepthCategorySelect(categoryLevels[level - 1] ?? [], selectedIds[level - 1] ?? undefined);
    setSelectDepth(level);
  }

  return (
    <div>
      <TheadSmall>지역 카테고리 선택</TheadSmall>
      <FlexRow
        style={{ backgroundColor: '#f5f5f5', overflowX: 'scroll', flexGrow: 1 }}
      >
        <FlexRow
          style={{
            width: 'auto',
            gap: 10
          }}
        >
          {categoryLevels.length > 0 ? categoryLevels.map((categories, level) => (
            <Flex
              key={level}
              style={{
                width: 200
              }}
            >
              <BtnCheckBoxStyle
                onClick={() => onClickDepth(level)}
                className={selectDepth === level ? 'active' : ''}
              >
                레벨 {level}
              </BtnCheckBoxStyle>
              <select
                style={{
                  marginTop: 5
                }}
                id={level.toString()}
                value={selectedIds[level] ?? '-'}
                onChange={(e) => handleSelect(level, Number(e.target.value))}
              >
                <option value="">선택하세요</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({GovermentTypeLabel[cat.govermentType]})
                  </option>
                ))}
              </select>
            </Flex>

          )) : undefined}
        </FlexRow>
      </FlexRow>

    </div>

  )
});

export default RegionCategorySelector;