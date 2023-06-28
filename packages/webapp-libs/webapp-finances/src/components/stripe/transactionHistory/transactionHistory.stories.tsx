import { paymentMethodFactory, transactionHistoryEntryFactory } from '@sb/webapp-api-client/tests/factories';
import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { fillAllStripeChargesQuery } from '../../../tests/factories';
import { withProviders } from '../../../utils/storybook';
import { TransactionHistory } from './transactionHistory.component';

const Template: StoryFn = () => {
  return <TransactionHistory />;
};

const meta: Meta = {
  title: 'Finances/TransactionHistory',
  component: TransactionHistory,
  decorators: [
    withProviders({
      apolloMocks: (defaultMocks) => {
        const data = [
          transactionHistoryEntryFactory({
            created: new Date(2020, 5, 5).toString(),
            amount: 50,
            paymentMethod: paymentMethodFactory({
              card: { last4: '1234' },
              billingDetails: { name: 'Owner 1' },
            }),
          }),
          transactionHistoryEntryFactory({
            created: new Date(2020, 10, 10).toString(),
            amount: 100,
            paymentMethod: paymentMethodFactory({
              card: { last4: '9876' },
              billingDetails: { name: 'Owner 2' },
            }),
          }),
        ];
        return defaultMocks.concat([fillAllStripeChargesQuery(data)]);
      },
    }),
  ],
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
};
