import { createReducer, PayloadAction } from '@reduxjs/toolkit';

import * as subscriptionActions from './subscription.actions';
import {
  SubscriptionState,
  FetchSubscriptionSuccessPayload,
  FetchSubscriptionPlansSuccessPayload,
} from './subscription.types';

export const INITIAL_STATE: SubscriptionState = {
  activeSubscription: null,
  availablePlans: [],
};

const handleFetchSubscriptionSuccess = (
  state: SubscriptionState,
  { payload }: PayloadAction<FetchSubscriptionSuccessPayload>
) => {
  state.activeSubscription = payload;
};

const handleFetchSubscriptionPlansSuccess = (
  state: SubscriptionState,
  { payload }: PayloadAction<FetchSubscriptionPlansSuccessPayload>
) => {
  state.availablePlans = payload;
};

export const reducer = createReducer(INITIAL_STATE, (builder) => {
  builder.addCase(subscriptionActions.fetchActiveSubscription.resolved, handleFetchSubscriptionSuccess);
  builder.addCase(subscriptionActions.fetchAvailableSubscriptionPlans.resolved, handleFetchSubscriptionPlansSuccess);
});
