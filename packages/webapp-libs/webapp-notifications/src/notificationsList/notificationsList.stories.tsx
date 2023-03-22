import { Story } from '@storybook/react';
import { append } from 'ramda';

import { NotificationTypes } from '../notifications.types';
import { fillNotificationsListQuery, notificationFactory } from '../tests/factories';
import { withProviders } from '../utils/storybook';
import { NotificationsList, NotificationsListProps } from './notificationsList.component';

const Template: Story<NotificationsListProps> = (args: NotificationsListProps) => {
  return <NotificationsList {...args} />;
};

export default {
  title: 'Shared/Notifications/NotificationsList',
  component: NotificationsList,
};

export const Default = Template.bind({});
Default.args = { isOpen: true };
Default.decorators = [
  withProviders({
    apolloMocks: append(
      fillNotificationsListQuery([
        notificationFactory({
          type: NotificationTypes.CRUD_ITEM_CREATED,
          data: {
            id: '1',
            user: 'example@example.com',
            name: 'Lorem ipsum',
          },
        }),
        notificationFactory({
          readAt: new Date().toISOString(),
          type: NotificationTypes.CRUD_ITEM_UPDATED,
          data: {
            id: '1',
            user: 'example@example.com',
            name: 'Lorem ipsum',
          },
        }),
      ])
    ),
  }),
];

export const Empty = Template.bind({});
Empty.args = { isOpen: true };
Empty.decorators = [
  withProviders({
    apolloMocks: append(fillNotificationsListQuery([])),
  }),
];