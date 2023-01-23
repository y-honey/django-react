import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { useApiForm } from '../../../hooks/useApiForm';
import { usePromiseMutation } from '../../../services/graphqlApi/usePromiseMutation';
import { useCommonQuery } from '../../../../app/providers/commonQuery';
import { useGenerateLocalePath } from '../../../hooks/localePaths';
import { RoutesConfig } from '../../../../app/config/routes';
import authSignupMutationGraphql, {
  authSignupMutation,
} from '../../../../modules/auth/__generated__/authSignupMutation.graphql';
import { SignupFormFields } from './signupForm.types';

export const useSignupForm = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();
  const { reload: reloadCommonQuery } = useCommonQuery();

  const form = useApiForm<SignupFormFields>({
    errorMessages: {
      email: {
        unique: intl.formatMessage({
          defaultMessage: 'The email address is already taken',
          id: 'Auth / Signup / email unique',
        }),
      },
      password: {
        password_too_common: intl.formatMessage({
          defaultMessage: 'The password is too common.',
          id: 'Auth / Signup / password too common',
        }),
        password_entirely_numeric: intl.formatMessage({
          defaultMessage: "The password can't be entirely numeric.",
          id: 'Auth / Signup / password entirely numeric',
        }),
      },
    },
  });

  const { handleSubmit, setGraphQLResponseErrors } = form;

  const [commitSignupMutation] = usePromiseMutation<authSignupMutation>(authSignupMutationGraphql);

  const handleSignup = handleSubmit(async (data: SignupFormFields) => {
    try {
      const { errors } = await commitSignupMutation({
        variables: {
          input: {
            email: data.email,
            password: data.password,
          },
        },
      });

      if (errors) {
        setGraphQLResponseErrors(errors);
      } else {
        reloadCommonQuery();
        navigate(generateLocalePath(RoutesConfig.home));
      }
    } catch {}
  });

  return { ...form, handleSignup };
};
