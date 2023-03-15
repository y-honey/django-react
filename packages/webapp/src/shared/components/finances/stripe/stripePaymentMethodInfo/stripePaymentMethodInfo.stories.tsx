import { useQuery } from '@apollo/client';
import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription/types';
import { subscriptionPhaseFactory, subscriptionPlanFactory } from '@sb/webapp-api-client/tests/factories';
import { Story } from '@storybook/react';
import { append } from 'ramda';

import { fillSubscriptionScheduleQueryWithPhases } from '../../../../../tests/factories';
import { mapConnection } from '../../../../utils/graphql';
import { withProviders } from '../../../../utils/storybook';
import { stripeSubscriptionQuery } from '../stripePaymentMethodSelector/stripePaymentMethodSelector.graphql';
import { StripePaymentMethodInfo, StripePaymentMethodInfoProps } from './stripePaymentMethodInfo.component';

const Template: Story<StripePaymentMethodInfoProps> = (args: StripePaymentMethodInfoProps) => {
  const { data } = useQuery(stripeSubscriptionQuery, { nextFetchPolicy: 'cache-and-network' });

  const paymentMethods = mapConnection((plan) => plan, data?.allPaymentMethods);
  const firstPaymentMethod = paymentMethods?.[0];

  return <StripePaymentMethodInfo method={firstPaymentMethod} />;
};

export default {
  title: 'Shared/Finances/Stripe/StripePaymentMethodInfo',
  component: StripePaymentMethodInfo,
  decorators: [
    withProviders({
      apolloMocks: append(
        fillSubscriptionScheduleQueryWithPhases([
          subscriptionPhaseFactory({
            item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
          }),
        ])
      ),
    }),
  ],
};

export const Default = Template.bind({});
