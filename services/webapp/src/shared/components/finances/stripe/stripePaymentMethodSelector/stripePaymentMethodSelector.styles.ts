import styled from 'styled-components';
import { heading5, MicroLabel } from '../../../../../theme/typography';
import { sizeUnits } from '../../../../../theme/size';
import { RadioButton } from '../../../radioButton';
import { Button } from '../../../button';
import { ButtonVariant } from '../../../button/button.types';
import { color } from '../../../../../theme';

export const Container = styled.div``;

export const PaymentMethodList = styled.ul`
  list-style: none;
`;

export const PaymentMethodListItem = styled.li`
  & + & {
    margin-top: ${sizeUnits(1)};
  }
`;

export const ExistingPaymentMethodItem = styled(RadioButton)`
  width: 100%;
`;

export const CardBrand = styled.span`
  text-transform: capitalize;
`;

export const NewPaymentMethodItem = styled(Button).attrs((props: { isSelected: boolean }) => ({
  variant: props.isSelected ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY,
}))<{ isSelected: boolean }>`
  width: 100%;
  max-width: none;
`;

export const CardElementContainer = styled.div`
  margin-top: ${sizeUnits(3)};
`;

export const Heading = styled.h3`
  ${heading5};
  margin-top: ${sizeUnits(3)};
  margin-bottom: ${sizeUnits(1)};
`;

export const ErrorMessage = styled(MicroLabel)`
  margin-top: 2px;
  color: ${color.error};
`;
