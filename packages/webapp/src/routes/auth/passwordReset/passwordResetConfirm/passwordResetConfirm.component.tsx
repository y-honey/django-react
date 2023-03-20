import { Link } from '@sb/webapp-core/components/buttons';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate, useParams } from 'react-router';

import { RoutesConfig } from '../../../../app/config/routes';
import { PasswordResetConfirmForm } from '../../../../shared/components/auth/passwordResetConfirmForm';
import { Container, Header, Links, Text } from './passwordResetConfirm.styles';

export const PasswordResetConfirm = () => {
  type Params = {
    token: string;
    user: string;
  };
  const navigate = useNavigate();
  const params = useParams<keyof Params>() as Params;
  const generateLocalePath = useGenerateLocalePath();

  const isTokenInUrl = params.token && params.user;

  useEffect(() => {
    if (!isTokenInUrl) {
      navigate(generateLocalePath(RoutesConfig.login));
    }
  }, [navigate, isTokenInUrl, generateLocalePath]);

  if (!isTokenInUrl) {
    return null;
  }

  return (
    <Container>
      <Header>
        <FormattedMessage defaultMessage="Change your password" id="Auth / Confirm reset password / heading" />
      </Header>
      <Text>
        <FormattedMessage defaultMessage="Set your new password." id="Auth / Confirm reset password / description" />
      </Text>

      <PasswordResetConfirmForm user={params.user} token={params.token} />

      <Links>
        <Link to={generateLocalePath(RoutesConfig.login)}>
          <FormattedMessage defaultMessage="Go back to log in" id="Auth / Confirm reset password / login link" />
        </Link>
      </Links>
    </Container>
  );
};
