import { fenxyBlue } from '@/util/constants/style';
import styled from '@emotion/styled';
import { FlexRow } from '@/common/styledComponents';

// 작은버튼 : 수정, 삭제, 목록, 글쓰기 등등
export const StyledButton = styled.div({
  fontSize: 12,
  minHeight: 32,
  padding: 6,
  paddingLeft: 10,
  paddingRight: 10,
  borderRadius: 8,
  fontWeight: 500,
  marginLeft: 10,
  cursor: 'pointer',
  color: 'white',
});

// 큰버튼 : 검색하기, 초기화
export const StyledLargeButton = styled.div({
  fontSize: 16,
  minHeight: 44,
  width: 160,
  borderRadius: 8,
  marginLeft: 5,
  marginRight: 5,
  lineHeight: '44px',
  textAlign: 'center',
  cursor: 'pointer',
  color: '#999',
  border: '1px solid #ddd',
});

// 관리자 주 사용되는 contentStyle
export const BorderRoundedContent = styled.div({
  marginTop: 20,
  borderRadius: 8,
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  overflow: 'hidden',
});

export const ContentHeader = styled(FlexRow)({
  height: 60,
  alignItems: 'center',
  borderBottom: '1px solid #ddd',
  padding: '0 30px',
  '.title': {
    flexGrow: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export const TheadSmall = styled.div`
  font-size: 12px;
  line-height: 18px;
  color: #999;
  margin-bottom: 8px;
  & > span {
    color: ${fenxyBlue};
  }
  & ~ div {
    border-bottom: 1px solid #ddd;
    padding-bottom: 8px;
  }
  & ~ div.notBottomBorder {
    padding-bottom: 0px;
    border-bottom: 0px;
  }
`;

export const InputStyle = styled.input`
  display: flex;
  font-size: 16px;
  line-height: 2rem;
  border: 0;
  outline: none;
  padding: 0;
  color: #333;
  background: transparent;
  &:disabled {
    color: #999;
  }
  &::-webkit-input-placeholder {
    color: #999;
  }
  &::-ms-input-placeholder {
    color: #999;
  }
  &:focus {
    color: ${fenxyBlue};
  }
`;

export const TextareaInputStyle = styled.textarea`
  display: block;
  font-size: 16px;
  line-height: 1.5rem;
  border: 1px solid #ddd;
  outline: none;
  color: #333;
  background: transparent;
  padding: 12px;
  min-height: 250px;
  &::-webkit-input-placeholder {
    color: #999;
  }
  &::-ms-input-placeholder {
    color: #999;
  }
  font-family: 'Noto Sans KR';
  font-weight: 300;
`;

//check box
export const CheckBoxStyle = styled.div({
  width: 120,
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

export const Bar = styled.div({
  height: 1,
  background: '#eee',
});
