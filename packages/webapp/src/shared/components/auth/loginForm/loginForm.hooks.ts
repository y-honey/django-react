import { useMutation } from '@apollo/client';
import { useApiForm } from '@sb/webapp-api-client/hooks';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import { authSinginMutation } from './loginForm.graphql';
import { LoginFormFields } from './loginForm.types';

export const useLoginForm = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();
  const { reload: reloadCommonQuery } = useCommonQuery();

  const form = useApiForm<LoginFormFields>({
    errorMessages: {
      nonFieldErrors: {
        no_active_account: intl.formatMessage({
          defaultMessage: 'Incorrect authentication credentials.',
          id: 'Login form / error / no active account',
        }),
        authentication_failed: intl.formatMessage({
          defaultMessage: 'Incorrect authentication credentials.',
          id: 'Login form / error / authentication failed',
        }),
      },
    },
  });
  const { handleSubmit, setApolloGraphQLResponseErrors } = form;

  const [commitLoginMutation, { loading }] = useMutation(authSinginMutation, {
    onCompleted: ({ tokenAuth }) => {
      if (tokenAuth?.otpAuthToken) {
        return navigate(generateLocalePath(RoutesConfig.validateOtp));
      }

      reloadCommonQuery();

      trackEvent('auth', 'log-in');

      navigate(generateLocalePath(RoutesConfig.home));
    },
    onError: (error) => {
      setApolloGraphQLResponseErrors(error.graphQLErrors);
    },
  });

  const handleLogin = handleSubmit((data: LoginFormFields) => {
    commitLoginMutation({
      variables: {
        input: data,
      },
    });
  });

  return { ...form, loading, handleLogin };
};
