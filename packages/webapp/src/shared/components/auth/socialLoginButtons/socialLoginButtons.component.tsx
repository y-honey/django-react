import { useOAuthLogin } from '@sb/webapp-api-client/api/auth';
import { Button, ButtonVariant } from '@sb/webapp-core/components/buttons';
import { HTMLAttributes } from 'react';
import { FormattedMessage } from 'react-intl';

import { FacebookIcon, GoogleIcon } from '../../../../images/icons';
import { OAuthProvider } from '../../../../modules/auth/auth.types';
import { Container } from './socialLoginButtons.styles';

export enum SignupButtonsVariant {
  LOGIN,
  SIGNUP,
}

export type SocialLoginButtonsProps = HTMLAttributes<HTMLDivElement> & {
  variant: SignupButtonsVariant;
};

export const SocialLoginButtons = ({ variant, ...props }: SocialLoginButtonsProps) => {
  const oAuthLogin = useOAuthLogin();
  const handleGoogleLogin = () => oAuthLogin(OAuthProvider.Google);
  const handleFacebookLogin = () => oAuthLogin(OAuthProvider.Facebook);

  return (
    <Container {...props}>
      <Button icon={<FacebookIcon />} variant={ButtonVariant.SECONDARY} onClick={handleFacebookLogin}>
        {variant === SignupButtonsVariant.LOGIN ? (
          <FormattedMessage defaultMessage="Log in with Facebook" id="Auth / Login / Facebook login button" />
        ) : (
          <FormattedMessage defaultMessage="Sign up with Facebook" id="Auth / Signup / Facebook signup button" />
        )}
      </Button>

      <Button icon={<GoogleIcon />} variant={ButtonVariant.SECONDARY} onClick={handleGoogleLogin}>
        {variant === SignupButtonsVariant.LOGIN ? (
          <FormattedMessage defaultMessage="Log in with Google" id="Auth / Login / Google login button" />
        ) : (
          <FormattedMessage defaultMessage="Sign up with Google" id="Auth / Signup / Google signup button" />
        )}
      </Button>
    </Container>
  );
};
