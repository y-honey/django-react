import graphene
from django.shortcuts import get_object_or_404
from graphql_relay import to_global_id

from common.graphql import mutations
from graphene import relay
from graphene_django import DjangoObjectType

from apps.content import models as content_models
from . import models, serializers


class CrudDemoItemType(DjangoObjectType):
    class Meta:
        model = models.CrudDemoItem
        interfaces = (relay.Node,)


class ContentfulDemoItemFavoriteType(DjangoObjectType):
    class Meta:
        model = models.ContentfulDemoItemFavorite
        interfaces = (relay.Node,)


class ContentfulDemoItemType(DjangoObjectType):
    pk = graphene.String()

    class Meta:
        model = content_models.DemoItem
        interfaces = (relay.Node,)


class CrudDemoItemConnection(graphene.Connection):
    class Meta:
        node = CrudDemoItemType


class ContentfulDemoItemFavoriteConnection(graphene.Connection):
    class Meta:
        node = ContentfulDemoItemFavoriteType


class CreateCrudDemoItemMutation(mutations.CreateModelMutation):
    class Meta:
        serializer_class = serializers.CrudDemoItemSerializer
        edge_class = CrudDemoItemConnection.Edge


class DocumentDemoItemType(DjangoObjectType):
    class Meta:
        model = models.DocumentDemoItem
        interfaces = (relay.Node,)


class DocumentDemoItemConnection(graphene.Connection):
    class Meta:
        node = DocumentDemoItemType


class CreateDocumentDemoItemMutation(mutations.CreateModelMutation):
    class Meta:
        serializer_class = serializers.DocumentDemoItemSerializer
        edge_class = DocumentDemoItemConnection.Edge


class CreateFavoriteContentfulDemoItemMutation(mutations.CreateModelMutation):
    class Meta:
        serializer_class = serializers.ContentfulDemoItemFavoriteSerializer
        edge_class = ContentfulDemoItemFavoriteConnection.Edge


class DeleteFavoriteContentfulDemoItemMutation(mutations.DeleteModelMutation):
    class Input:
        item = graphene.String()

    class Meta:
        model = models.ContentfulDemoItemFavorite

    @classmethod
    def get_object(cls, **kwargs):
        model = cls._meta.model
        return get_object_or_404(model, **kwargs)

    @classmethod
    def mutate_and_get_payload(cls, root, info, item, *args, **kwargs):
        obj = cls.get_object(item=item, user=info.context.user)
        deleted_id = obj.id
        obj.delete()
        return cls(deleted_ids=[to_global_id('ContentfulDemoItemFavoriteType', deleted_id)])


class DeleteDocumentDemoItemMutation(mutations.DeleteModelMutation):
    class Meta:
        model = models.DocumentDemoItem

    @classmethod
    def mutate_and_get_payload(cls, root, info, id):
        obj = cls.get_object(id, created_by=info.context.user)
        obj.delete()
        return cls(deleted_ids=[id])


class UpdateCrudDemoItemMutation(mutations.UpdateModelMutation):
    class Meta:
        serializer_class = serializers.CrudDemoItemSerializer
        edge_class = CrudDemoItemConnection.Edge


class DeleteCrudDemoItemMutation(mutations.DeleteModelMutation):
    class Meta:
        model = models.CrudDemoItem


class Query(graphene.ObjectType):
    crud_demo_item = graphene.relay.Node.Field(CrudDemoItemType)
    all_crud_demo_items = graphene.relay.ConnectionField(CrudDemoItemConnection)
    all_contentful_demo_item_favorites = graphene.relay.ConnectionField(ContentfulDemoItemFavoriteConnection)
    all_document_demo_items = graphene.relay.ConnectionField(DocumentDemoItemConnection)

    def resolve_all_crud_demo_items(root, info, **kwargs):
        return models.CrudDemoItem.objects.all()

    def resolve_all_contentful_demo_item_favorites(root, info, **kwargs):
        return models.ContentfulDemoItemFavorite.objects.filter(user=info.context.user)

    def resolve_all_document_demo_items(root, info, **kwargs):
        return info.context.user.documents.all()


class Mutation(graphene.ObjectType):
    create_crud_demo_item = CreateCrudDemoItemMutation.Field()
    update_crud_demo_item = UpdateCrudDemoItemMutation.Field()
    delete_crud_demo_item = DeleteCrudDemoItemMutation.Field()
    create_document_demo_item = CreateDocumentDemoItemMutation.Field()
    delete_document_demo_item = DeleteDocumentDemoItemMutation.Field()
    create_favorite_contentful_demo_item = CreateFavoriteContentfulDemoItemMutation.Field()
    delete_favorite_contentful_demo_item = DeleteFavoriteContentfulDemoItemMutation.Field()
