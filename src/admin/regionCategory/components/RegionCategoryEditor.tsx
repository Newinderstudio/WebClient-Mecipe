'use client'

import { useEffect, useState, } from 'react'
import styled from '@emotion/styled'
import {
  useCreateRegionCategoryByAdminMutation,
  useFindAllRegionCategoriesByAdminMutation,
  RegionCategoryResult,
  GovermentTypeLabel,
  RegionCategoryTreeTable,
} from '@/api/regionCategoriesApi'
import { FlexRow } from '@/common/styledComponents'
import { GovermentType } from '@/data/prisma-client'

interface Props {
  initialData?: {
    id: number
    name: string
    govermentTYpe: string
    isDisable: boolean
    parentId?: number
  }
  parentCandidates: {list: RegionCategoryResult[], target?:number},
  getCategories: (data: RegionCategoryTreeTable) => void;
}

const Wrapper = styled.div`
  width: 100%;
  margin: auto;
`

const Field = styled.div`
  min-width: 200px;
`

const Label = styled.label`
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
`

const Input = styled.input`
  width: 100%;
  padding: 8px;
`

const Select = styled.select`
  width: 100%;
  padding: 8px;
`

const Checkbox = styled.input`
  margin-right: 8px;
`

const Button = styled.button`
  background-color: #000;
  color: #fff;
  padding: 12px;
  width: 100%;
  border: none;
  cursor: pointer;
  width: 200px;
`
const GOVERMENT_TYPE = Object.entries(GovermentTypeLabel)

export const RegionCategoryEditor = ({ initialData, parentCandidates, getCategories }: Props) => {
  const [name, setName] = useState('')
  const [govermentType, setGovermentTYpe] = useState<GovermentType>('CITY')
  const [isDisable, setIsDisable] = useState(false)
  const [parentId, setParentId] = useState<number | undefined>(undefined)

  const [createRegion] = useCreateRegionCategoryByAdminMutation()
  const [findAllRegionCategoriesByAdmin] = useFindAllRegionCategoriesByAdminMutation();

  useEffect(()=>{
    if(parentCandidates.list.length===0) setParentId(undefined);
    else {
      const targetId = parentCandidates.target ?? 0;
      setParentId(targetId);
    }
  },[parentCandidates])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // alert(`goverment:${govermentType}, name:${name}, parentId:${parentId}`);
    // return;

    if (
      parentCandidates.list.length === 0 && !(
        govermentType === 'SPECIAL_SELF_GOVERNING_CITY' ||
        govermentType === 'SPECIAL_SELF_GOVERNING_PROVINCE' ||
        govermentType === 'METROPOLITAN_CITY' ||
        govermentType === 'PROVINCE'
      )
    ) {
      alert(`최상위 카테고리에 ${GovermentTypeLabel[govermentType]}를 선택할 수 없습니다.`)
      return;
    }

    try {
      await createRegion({
        body: {
          name,
          govermentType
        },
        parentId: parentId
      }).unwrap()

      alert('✅ 지역 카테고리 등록 완료');
      setName('');
      setIsDisable(false);

      const result = await findAllRegionCategoriesByAdmin().unwrap();

      getCategories(result);
    } catch (err) {
      console.error(err)
      alert('❌ 등록 실패')
    }
  }

  const isDisplayRegionSelect = () => {
    return parentCandidates.list.length !== 0
  }
  const isDisplayDisableButton = () => {
    return initialData !== undefined;
  }
  return (
    <Wrapper>
      <h2>{initialData ? '지역 카테고리 수정' : '지역 카테고리 추가'}</h2>
      <form onSubmit={handleSubmit}>
        <FlexRow
          style={{
            gap: 10
          }}
        >
          <Field>
            <Label>이름</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field>
            <Label>행정 구분</Label>
            <Select value={govermentType} onChange={(e) => setGovermentTYpe(e.target.value)}>
              {GOVERMENT_TYPE.map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </Select>
          </Field>
          {
            isDisplayRegionSelect() ? <Field>
              <Label>상위 지역 선택</Label>
              <Select value={parentId ?? ''} onChange={(e) => setParentId(Number(e.target.value))}>
                {parentCandidates?.list.length > 0 ? parentCandidates.list.map((cat: RegionCategoryResult) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.govermentType})
                  </option>
                )) : undefined}
              </Select>
            </Field> : undefined
          }
          {
            isDisplayDisableButton() ? <Field>
              <Label>
                <Checkbox
                  type="checkbox"
                  checked={isDisable}
                  onChange={(e) => setIsDisable(e.target.checked)}
                />
                비활성화
              </Label>
            </Field> : undefined
          }

          <Button type="submit">{initialData ? '수정하기' : '추가하기'}</Button>
        </FlexRow>

      </form>
    </Wrapper>
  )
}

export default RegionCategoryEditor;