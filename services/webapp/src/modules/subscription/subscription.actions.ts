import { actionCreator } from '../helpers/actionCreator';
import {
  SubscriptionUpdateApiRequestData,
  SubscriptionUpdateApiResponseData,
} from '../../shared/services/api/subscription/types';
import { FetchSubscriptionSuccessPayload } from './subscription.types';

const { createPromiseAction } = actionCreator('SUBSCRIPTION');

export const fetchActiveSubscription = createPromiseAction<void, FetchSubscriptionSuccessPayload>(
  'FETCH_ACTIVE_SUBSCRIPTION'
);

export const updateSubscriptionPlan = createPromiseAction<
  SubscriptionUpdateApiRequestData,
  SubscriptionUpdateApiResponseData
>('UPDATE_SUBSCRIPTION');

export const cancelSubscription = createPromiseAction<void, void>('CANCEL_SUBSCRIPTION');
