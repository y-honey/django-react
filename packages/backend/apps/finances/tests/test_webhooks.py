import datetime

import calleee
import pytest

from djstripe import models as djstripe_models
from .utils import stripe_encode
from .. import notifications

pytestmark = pytest.mark.django_db


class TestCancelTrialSubscriptionOnPaymentFailure:
    def test_previously_trialing_subscription_is_canceled(
        self, webhook_event_factory, subscription_factory, monthly_plan_price, stripe_request
    ):
        start_date = datetime.datetime.now(tz=datetime.timezone.utc)
        subscription = subscription_factory(
            start_date=start_date,
            trial_end=start_date,
            items=[
                {
                    # The hardcoded ID is equal to the one returned from stripe-mock
                    # If the test fails after stripe-mock update you most likely need to change this to match their
                    # fixtures
                    'id': 'si_IyZyeAN1KSAd6Z',
                    'price': monthly_plan_price.id,
                }
            ],
        )
        webhook_event = webhook_event_factory(
            type='invoice.payment_failed',
            data={
                'object': {
                    'object': 'invoice',
                    'subscription': subscription.id,
                    'customer': subscription.customer.id,
                }
            },
        )

        webhook_event.invoke_webhook_handlers()

        stripe_request.assert_any_call(
            'delete',
            calleee.EndsWith(f'/subscriptions/{subscription.id}'),
            calleee.Any(),
            None,
        )


class TestSubscriptionScheduleRelease:
    def test_subscription_schedule_from_subscription(
        self, webhook_event_factory, subscription_schedule_factory, monthly_plan_price, stripe_request
    ):
        schedule = subscription_schedule_factory(phases=[{'items': [{'price': monthly_plan_price.id}]}])
        webhook_event = webhook_event_factory(
            type='subscription_schedule.released',
            data={
                'object': {
                    'object': 'subscription_schedule',
                    'released_subscription': schedule.customer.subscription.id,
                    'customer': schedule.customer.id,
                }
            },
        )

        webhook_event.invoke_webhook_handlers()

        stripe_request.assert_any_call(
            'post',
            calleee.EndsWith('/subscription_schedules'),
            calleee.Any(),
            stripe_encode({'from_subscription': schedule.customer.subscription.id}),
        )


class TestSendSubscriptionErrorEmail:
    def test_send_email_on_invoice_payment_failed(self, webhook_event_factory, subscription, task_apply):
        webhook_event = webhook_event_factory(
            type='invoice.payment_failed',
            data={
                'object': {
                    'object': 'invoice',
                    'subscription': subscription.id,
                    'customer': subscription.customer.id,
                }
            },
        )

        webhook_event.invoke_webhook_handlers()

        task_apply.assert_email_sent(notifications.SubscriptionErrorEmail, subscription.customer.subscriber.email)

    def test_send_email_on_invoice_payment_required(self, webhook_event_factory, subscription, task_apply):
        webhook_event = webhook_event_factory(
            type='invoice.payment_action_required',
            data={
                'object': {
                    'object': 'invoice',
                    'subscription': subscription.id,
                    'customer': subscription.customer.id,
                }
            },
        )

        webhook_event.invoke_webhook_handlers()

        task_apply.assert_email_sent(notifications.SubscriptionErrorEmail, subscription.customer.subscriber.email)


class TestSendTrialExpiresSoonEmail:
    def test_previously_trialing_subscription_is_canceled(self, webhook_event_factory, customer, task_apply):
        webhook_event = webhook_event_factory(
            type='customer.subscription.trial_will_end',
            data={'object': {'object': 'subscription', 'customer': customer.id, 'trial_end': 1617103425}},
        )

        webhook_event.invoke_webhook_handlers()

        task_apply.assert_email_sent(
            notifications.TrialExpiresSoonEmail, customer.subscriber.email, {'expiry_date': '2021-03-30T11:23:45Z'}
        )


class TestPaymentMethodDetached:
    def test_delete_payment_method_instance(self, payment_method, webhook_event_factory):
        webhook_event = webhook_event_factory(
            type='payment_method.detached',
            data={
                'object': {'object': 'payment_method', 'id': payment_method.id, 'customer': payment_method.customer.id}
            },
        )

        webhook_event.invoke_webhook_handlers()

        assert not djstripe_models.PaymentMethod.objects.filter(id=payment_method.id).exists()
