import pytest
from django.contrib.auth import get_user_model
from djstripe import models as djstripe_models

from .. import constants

pytestmark = pytest.mark.django_db

User = get_user_model()


class TestCreateFreePlanSubscriptionSignal:
    def test_create_subscription_on_user_creation(self, user_factory):
        user = user_factory()
        customer = djstripe_models.Customer.objects.get(subscriber=user)
        free_plan_product = djstripe_models.Product.objects.get(name=constants.FREE_PLAN.name)
        assert customer.is_subscribed_to(free_plan_product)
