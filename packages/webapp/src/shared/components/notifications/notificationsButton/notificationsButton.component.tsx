import mailOutlineIcon from '@iconify-icons/ion/mail-outline';
import mailUnreadOutlineIcon from '@iconify-icons/ion/mail-unread-outline';
import { ButtonProps, ButtonVariant } from '@saas-boilerplate-app/webapp-core/components/buttons';
import { Icon } from '@saas-boilerplate-app/webapp-core/components/icons';
import { useIntl } from 'react-intl';

import { FragmentType, gql, useFragment } from '../../../services/graphqlApi/__generated/gql';
import { Button } from './notificationsButton.styles';

export const NOTIFICATIONS_BUTTON_CONTENT_FRAGMENT = gql(/* GraphQL */ `
  fragment notificationsButtonContent on Query {
    hasUnreadNotifications
  }
`);

export type NotificationsButtonProps = Omit<ButtonProps, 'children' | 'variant'> & {
  queryResult?: FragmentType<typeof NOTIFICATIONS_BUTTON_CONTENT_FRAGMENT>;
};

export const NotificationsButton = ({ queryResult, ...props }: NotificationsButtonProps) => {
  const data = useFragment(NOTIFICATIONS_BUTTON_CONTENT_FRAGMENT, queryResult);

  return <Content hasUnreadNotifications={data?.hasUnreadNotifications ?? false} {...props} />;
};

type ContentProps = Omit<NotificationsButtonProps, 'queryResult'> & {
  hasUnreadNotifications: boolean;
};

const Content = ({ hasUnreadNotifications, ...props }: ContentProps) => {
  const intl = useIntl();

  return (
    <Button
      variant={ButtonVariant.ROUND}
      hasUnreadNotifications={hasUnreadNotifications}
      aria-label={intl.formatMessage({
        defaultMessage: 'Open notifications',
        id: 'Notifications / Notifications Button / Label',
      })}
      {...props}
    >
      <Icon icon={hasUnreadNotifications ? mailUnreadOutlineIcon : mailOutlineIcon} />
    </Button>
  );
};

NotificationsButton.Fallback = () => <Content hasUnreadNotifications={false} />;
