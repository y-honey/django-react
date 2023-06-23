import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { Elements } from '@stripe/react-stripe-js';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../config/routes';
import { stripePromise } from '../../services/stripe';
import { EditPaymentMethodForm } from './editPaymentMethodForm/editPaymentMethodForm.component';

export const EditPaymentMethod = () => {
  const intl = useIntl();
  const { toast } = useToast();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();

  const successMessage = intl.formatMessage({
    defaultMessage: 'Payment method changed successfully',
    id: 'Stripe edit payment method / successful message',
  });

  return (
    <PageLayout>
      <PageHeadline
        hasBackButton
        header={<FormattedMessage defaultMessage="Payment methods" id="Finances / Payment methods / heading" />}
        subheader={
          <FormattedMessage defaultMessage="Edit your payment methods" id="Finances / Payment methods / subheading" />
        }
      />

      <Elements stripe={stripePromise}>
        <EditPaymentMethodForm
          onSuccess={() => {
            navigate(generateLocalePath(RoutesConfig.subscriptions.index));
            toast({ description: successMessage });
          }}
        />
      </Elements>
    </PageLayout>
  );
};
