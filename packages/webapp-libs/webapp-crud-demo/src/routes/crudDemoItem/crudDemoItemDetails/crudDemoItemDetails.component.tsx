import { useQuery } from '@apollo/client';
import { gql } from '@sb/webapp-api-client/graphql';
import { PageHeadline } from '@sb/webapp-core/components/pageHeadline';
import { PageLayout } from '@sb/webapp-core/components/pageLayout';
import { Separator } from '@sb/webapp-core/components/separator';
import { Skeleton } from '@sb/webapp-core/components/skeleton';
import { useParams } from 'react-router';

export const crudDemoItemDetailsQuery = gql(/* GraphQL */ `
  query crudDemoItemDetailsQuery($id: ID!) {
    crudDemoItem(id: $id) {
      id
      name
    }
  }
`);

export const CrudDemoItemDetails = () => {
  type Params = {
    id: string;
  };
  const { id } = useParams<keyof Params>() as Params;

  const { loading, data } = useQuery(crudDemoItemDetailsQuery, {
    variables: {
      id,
    },
  });

  if (loading) {
    return (
      <PageLayout>
        <div className="flex w-full justify-between items-center">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-8" />
        </div>
        <Separator />
      </PageLayout>
    );
  }

  const itemData = data?.crudDemoItem;

  return (
    <PageLayout>
      <PageHeadline hasBackButton header={itemData?.name} />
    </PageLayout>
  );
};
