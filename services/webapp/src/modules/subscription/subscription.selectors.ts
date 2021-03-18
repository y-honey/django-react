import { createSelector } from '@reduxjs/toolkit';
import { GlobalState } from '../../config/reducers';

export const selectSubscriptionDomain = (state: GlobalState) => state.subscription;

export const selectActiveSubscription = createSelector(selectSubscriptionDomain, (state) => state.activeSubscription);

export const selectActiveSubscriptionRenewalDate = createSelector(
  selectActiveSubscription,
  (subscription) => subscription?.currentPeriodEnd
);

export const selectActiveSubscriptionPlan = createSelector(
  selectActiveSubscription,
  (subscription) => subscription?.item.price.product.name
);

export const selectActiveSubscriptionPaymentMethod = createSelector(
  selectActiveSubscription,
  (subscription) => subscription?.defaultPaymentMethod?.card
);
