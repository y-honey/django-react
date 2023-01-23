import { screen } from '@testing-library/react';
import { render } from '../../../../../tests/utils/rendering';
import { RelativeDate, RelativeDateProps } from '../relativeDate.component';
import { DAY, nowSub } from '../relativeDate.fixtures';

describe('RelativeDate: Component', () => {
  const defaultProps: RelativeDateProps = {
    date: new Date(),
  };

  const Component = (props: Partial<RelativeDateProps>) => <RelativeDate {...defaultProps} {...props} />;

  it('should render formatted relative days', () => {
    const date = nowSub(DAY);
    render(<Component date={date} />);

    expect(screen.getByTitle(date.getFullYear(), { exact: false })).toBeInTheDocument();
    expect(screen.getByText('1 day ago')).toBeInTheDocument();
  });

  it('should render absolute date if more than week ago', () => {
    const date = nowSub(DAY * 8);
    render(<Component date={date} />);

    expect(screen.queryByText('7 days ago')).not.toBeInTheDocument();
    expect(screen.getByText(date.getFullYear(), { exact: false })).toBeInTheDocument();
  });
});
