import { MockedResponse } from '@apollo/client/testing';
import { GraphQLError } from 'graphql/error';
import { DocumentNode } from 'graphql/language';

export function makeId(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

type PageInfo = { endCursor: string; hasNextPage: boolean; __typename: string };

type ComposeMockedQueryResultProps = {
  data: Record<string, any>;
  variables?: Record<string, any>;
  errors?: GraphQLError[];
};

export const composeMockedQueryResult = (
  query: DocumentNode,
  { variables, data, errors }: ComposeMockedQueryResultProps
): MockedResponse => {
  const result = {
    data,
    errors,
  };

  return {
    request: {
      query,
      variables,
    },
    result: jest.fn ? jest.fn(() => result) : () => structuredClone(result),
  };
};

type ComposeMockedListQueryResultProps = ComposeMockedQueryResultProps & {
  data: Array<any>;
  pageInfo?: PageInfo;
  additionalData?: Record<string, any>;
};

const defaultPageInfo = {
  endCursor: 'YXJyYXljb25uZWN0aW9uOjM=',
  hasNextPage: false,
  __typename: 'PageInfo',
};

export const mapRelayEdges = (data: Array<any>, typename: string, pageInfo?: PageInfo) => {
  return {
    edges: data.map((obj) => ({ node: { __typename: typename, ...obj }, cursor: defaultPageInfo.endCursor })),
    pageInfo: pageInfo || defaultPageInfo,
  };
};

export const composeMockedListQueryResult = (
  query: DocumentNode,
  key: string,
  typename: string,
  { variables, data, pageInfo, additionalData = {} }: ComposeMockedListQueryResultProps
): MockedResponse => {
  const composedData = {
    [key]: mapRelayEdges(data, typename, pageInfo),
    ...additionalData,
  } as Record<string, any>;

  return composeMockedQueryResult(query, {
    variables,
    data: composedData,
  });
};

export const composeMockedNestedListQueryResult = (
  query: DocumentNode,
  key: string,
  listKey: string,
  typename: string,
  { data, variables }: ComposeMockedListQueryResultProps
): MockedResponse =>
  composeMockedQueryResult(query, {
    variables,
    data: {
      [key]: {
        [listKey]: data.map((obj) => {
          const result = { __typename: typename, ...obj };
          if (listKey === 'edges') return { node: result };
          return result;
        }),
      },
    },
  });

export const composeMockedPaginatedListQueryResult = (
  query: DocumentNode,
  key: string,
  typename: string,
  resultProps: ComposeMockedListQueryResultProps,
  pageInfo: Pick<PageInfo, 'endCursor' | 'hasNextPage'>
): MockedResponse => {
  return composeMockedListQueryResult(query, key, typename, {
    ...resultProps,
    pageInfo: {
      __typename: 'PageInfo',
      ...pageInfo,
    },
  });
};