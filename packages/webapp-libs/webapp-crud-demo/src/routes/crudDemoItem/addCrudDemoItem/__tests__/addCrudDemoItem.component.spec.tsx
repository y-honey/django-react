import { fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render } from '../../../../tests/utils/rendering';
import { AddCrudDemoItem, addCrudDemoItemMutation } from '../addCrudDemoItem.component';

jest.mock('@sb/webapp-core/services/analytics');

describe('AddCrudDemoItem: Component', () => {
  const Component = () => <AddCrudDemoItem />;

  it('should display empty form', async () => {
    const { waitForApolloMocks } = render(<Component />);
    await waitForApolloMocks();
    const value = (await screen.findByPlaceholderText(/name/i)).getAttribute('value');
    expect(value).toBe('');
  });

  describe('action completes successfully', () => {
    it('should commit mutation', async () => {
      const commonQueryMock = fillCommonQueryWithUser();

      const variables = {
        input: { name: 'new item name' },
      };
      const data = {
        createCrudDemoItem: {
          crudDemoItemEdge: {
            node: {
              id: 1,
              ...variables.input,
            },
          },
        },
      };
      const requestMock = composeMockedQueryResult(addCrudDemoItemMutation, {
        variables,
        data,
      });
      requestMock.newData = jest.fn(() => ({
        data,
      }));

      render(<Component />, { apolloMocks: [commonQueryMock, requestMock] });

      await userEvent.type(await screen.findByPlaceholderText(/name/i), 'new item name');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));
      expect(requestMock.newData).toHaveBeenCalled();
    });

    it('should show success message', async () => {
      const commonQueryMock = fillCommonQueryWithUser();
      const variables = {
        input: { name: 'new item' },
      };
      const data = {
        createCrudDemoItem: {
          crudDemoItemEdge: {
            node: {
              id: 1,
              ...variables.input,
            },
          },
        },
      };
      const requestMock = composeMockedQueryResult(addCrudDemoItemMutation, {
        variables,
        data,
      });

      render(<Component />, {
        apolloMocks: [commonQueryMock, requestMock],
      });

      await userEvent.type(await screen.findByPlaceholderText(/name/i), 'new item');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      const toast = await screen.findByTestId('toast-1');

      expect(trackEvent).toHaveBeenCalledWith('crud', 'add', 1);
      expect(toast).toHaveTextContent('🎉 Changes saved successfully!');
    });
  });
});
