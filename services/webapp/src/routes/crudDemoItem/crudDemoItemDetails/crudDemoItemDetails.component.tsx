import React, { Suspense, useEffect } from 'react';
import graphql from 'babel-plugin-relay/macro';
import { useQueryLoader } from 'react-relay';
import { useParams } from 'react-router';
import { crudDemoItemDetailsQuery } from '../../../__generated__/crudDemoItemDetailsQuery.graphql';
import { CrudDemoItemDetailsContent } from './crudDemoItemDetailsContent.component';

export const CrudDemoItemDetails = () => {
  const { id } = useParams<{ id: string }>();

  const [queryRef, loadQuery] = useQueryLoader<crudDemoItemDetailsQuery>(graphql`
    query crudDemoItemDetailsQuery($id: ID!) {
      crudDemoItem(id: $id) {
        id
        name
      }
    }
  `);

  useEffect(() => {
    loadQuery({ id });
  }, [loadQuery, id]);

  if (!queryRef) {
    return null;
  }

  return (
    <Suspense fallback={<span>Loading ...</span>}>
      <CrudDemoItemDetailsContent queryRef={queryRef} />
    </Suspense>
  );
};
