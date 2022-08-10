import { screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from '../index';
import { DEFAULT_LOCALE } from '../../../../app/config/i18n';
import { makeContextRenderer, spiedHistory } from '../../../utils/testUtils';

describe('LanguageSwitcher: Component', () => {
  const component = () => <LanguageSwitcher />;
  const render = makeContextRenderer(component);

  it('should redirect after option click', () => {
    const { history, pushSpy } = spiedHistory(`/${DEFAULT_LOCALE}/some/custom/url`);
    render({}, { router: { history, routePath: '/:lang/some/custom/url' } });

    const event = { target: { value: 'pl' } };
    fireEvent.change(screen.getByRole('combobox'), event);

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith({ hash: '', pathname: '/pl/some/custom/url', search: '' }, undefined);
  });
});
