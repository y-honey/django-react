import { useMutation } from '@apollo/client';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../../app/config/routes';
import { useSnackbar } from '../../../modules/snackbar/snackbar.hooks';
import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { SUBSCRIPTION_CHANGE_ACTIVE_MUTATION } from './editSubscription.graphql';

export const useEditSubscription = () => {
  const intl = useIntl();
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();

  const successMessage = intl.formatMessage({
    id: 'Change plan / Success message',
    defaultMessage: 'Plan changed successfully',
  });

  const failMessage = intl.formatMessage({
    id: 'Change plan / Fail message',
    defaultMessage: 'You need first to add a payment method. Go back and set it there',
  });

  const [commitChangeActiveSubscriptionMutation, { loading }] = useMutation(SUBSCRIPTION_CHANGE_ACTIVE_MUTATION, {
    onError: () => {
      showMessage(failMessage);
    },
    onCompleted: () => {
      showMessage(successMessage);
      navigate(generateLocalePath(RoutesConfig.subscriptions.index));
    },
  });

  const selectPlan = (plan: string | null) => {
    if (!plan) return;

    commitChangeActiveSubscriptionMutation({
      variables: {
        input: {
          price: plan,
        },
      },
    });
  };

  return { selectPlan, loading };
};
