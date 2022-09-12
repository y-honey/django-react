import graphene

from apps.demo import schema as demo_schema
from apps.finances import schema as finances_schema
from apps.notifications import schema as notifications_schema
from apps.users import schema as users_schema
from common.graphql.utils import graphql_query, graphql_mutation, graphql_subscription

schema = graphene.Schema(
    query=graphql_query([demo_schema.Query, notifications_schema.Query, users_schema.Query, finances_schema.Query]),
    mutation=graphql_mutation(
        [
            demo_schema.Mutation,
            notifications_schema.Mutation,
            users_schema.AnyoneMutation,
            users_schema.AuthenticatedMutation,
            users_schema.Mutation,
            finances_schema.Mutation,
        ]
    ),
    subscription=graphql_subscription(([notifications_schema.Subscription])),
)

subscriptions_schema = graphene.Schema(query=graphql_subscription(([notifications_schema.Subscription])))
