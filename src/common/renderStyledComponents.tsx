import styled from '@emotion/styled';
import { renderContentPcWidth } from '@/util/constants/style';

export const RenderFlex = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

export const RenderContentFlex = styled(RenderFlex)({
  maxWidth: renderContentPcWidth,
  width: '100%',
  margin: '0 auto',
});
