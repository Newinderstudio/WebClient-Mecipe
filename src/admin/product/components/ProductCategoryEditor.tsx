'use client'

import { useEffect, useState, } from 'react'
import styled from '@emotion/styled'
import {
  ProductCategoryResult,
  ProductCategoryTreeTable,
} from '@/api/productCategoriesApi'
import { FlexRow } from '@/common/styledComponents'
import { useCreateProductCategoryByAdminMutation, useFindAllProductCategoriesByAdminMutation } from '@/api/productCategoriesApi'
import { StyledButton } from '@/common/styledAdmin'
import { fenxyBlue } from '@/util/constants/style'

interface Props {
  initialData?: {
    id: number
    name: string
    govermentTYpe: string
    isDisable: boolean
    parentId?: number
  }
  parentCandidates: { list: ProductCategoryResult[], target?: number },
  getCategories: (data: ProductCategoryTreeTable) => void;
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

export const ProductCategoryEditor = ({ initialData, parentCandidates, getCategories }: Props) => {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [isDisable, setIsDisable] = useState(false)
  const [isDuplicateCode, setIsDuplicateCode] = useState<boolean | undefined>(undefined)
  const [parentId, setParentId] = useState<number | undefined>(undefined)

  const [createProductCategory] = useCreateProductCategoryByAdminMutation()
  const [findAllProductCategoriesByAdmin] = useFindAllProductCategoriesByAdminMutation()

  useEffect(() => {
    if (parentCandidates.list.length === 0) setParentId(undefined);
    else {
      const targetId = parentCandidates.target ?? 0;
      setParentId(targetId);
    }
  }, [parentCandidates])

  const handleCheckDuplicateCode = async () => {
    if(code.trim().length === 0) {
      alert('❌ 코드를 입력해주세요.')
      return
    }

    const result = await findAllProductCategoriesByAdmin({code}).unwrap()
    setIsDuplicateCode(result)

    if(result === false) {
      alert('✅ 중복 코드가 없습니다.')
      return
    }

    alert('❌ 중복 코드 입니다.') 

  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(code.trim().length === 0) {
      alert('❌ 코드를 입력해주세요.')
      return
    }

    if(isDuplicateCode === undefined) {
      alert('❌ 중복 코드 확인을 해주세요.')
      return
    }

    if(isDuplicateCode === true && code.trim().length > 0) {
      alert('❌ 중복 코드 입니다.')
      return
    }

    if(name.trim().length === 0) {
      alert('❌ 이름을 입력해주세요.')
      return
    }

    if(description.trim().length === 0) {
      alert('❌ 설명을 입력해주세요.')
      return
    }


    try {
      const result = await createProductCategory({
        body: {
          name,
          code,
          description,
        },
        parentId
      }).unwrap()

      alert('✅ 상품 카테고리 등록 완료');
      setName('');
      setCode('');
      setDescription('');
      setIsDuplicateCode(undefined)
      getCategories(result);
    } catch (err) {
      console.error(err)
      alert('❌ 등록 실패')
    }
  }

  const isDisplayParentSelect = () => {
    return parentCandidates.list.length !== 0
  }
  const isDisplayDisableButton = () => {
    return initialData !== undefined;
  }
  return (
    <Wrapper>
      <h2>{initialData ? '상품 카테고리 수정' : '상품 카테고리 추가'}</h2>
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

          <FlexRow>
            <Field>
              <Label>코드</Label>
              <Input value={code} onChange={(e) => {setCode(e.target.value); setIsDuplicateCode(undefined)}} required />
            </Field>
            <StyledButton
            style={{
              backgroundColor: fenxyBlue,
              alignSelf: 'center'
            }}
            onClick={handleCheckDuplicateCode}>중복 코드 확인</StyledButton>
          </FlexRow>


          <Field>
            <Label>설명</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>

          {
            isDisplayParentSelect() ? <Field>
              <Label>상위 카테고리 선택</Label>
              <Select value={parentId ?? ''} onChange={(e) => setParentId(Number(e.target.value))}>
                {parentCandidates?.list.length > 0 ? parentCandidates.list.map((cat: ProductCategoryResult) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
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

export default ProductCategoryEditor;