import userEvent from '@testing-library/user-event';
import { act, screen } from '@testing-library/react';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { ConnectionHandler } from 'relay-runtime';
import { makeContextRenderer } from '../../../../shared/utils/testUtils';
import { snackbarActions } from '../../../../modules/snackbar';
import { AddCrudDemoItem } from '../addCrudDemoItem.component';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('AddCrudDemoItem: Component', () => {
  const component = () => <AddCrudDemoItem />;
  const render = makeContextRenderer(component);

  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should display empty form', () => {
    render();
    const value = screen.getByPlaceholderText(/name/i).getAttribute('value');
    expect(value).toBeNull();
  });

  describe('action completes successfully', () => {
    it('should commit mutation', async () => {
      const relayEnvironment = createMockEnvironment();

      render({}, { relayEnvironment });

      await userEvent.type(screen.getByPlaceholderText(/name/i), 'new item name');
      await userEvent.click(screen.getByRole('button', { name: /save/i }));

      const operation = relayEnvironment.mock.getMostRecentOperation();
      expect(operation.fragment.node.name).toEqual('addCrudDemoItemMutation');
      expect(operation.fragment.variables).toEqual({
        input: { name: 'new item name' },
        connections: [ConnectionHandler.getConnectionID('root', 'crudDemoItemList_allCrudDemoItems')],
      });

      await act(() => {
        relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
      });
    });

    it('should show success message', async () => {
      const relayEnvironment = createMockEnvironment();

      render({}, { relayEnvironment });

      await userEvent.type(screen.getByPlaceholderText(/name/i), 'new item');
      await userEvent.click(screen.getByRole('button', { name: /save/i }))

      const operation = relayEnvironment.mock.getMostRecentOperation();
      expect(operation.fragment.node.name).toEqual('addCrudDemoItemMutation');
      await act(() => {
        relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
      });

      expect(mockDispatch).toHaveBeenCalledWith(snackbarActions.showMessage('🎉 Changes saved successfully!'));
    });
  });
});
