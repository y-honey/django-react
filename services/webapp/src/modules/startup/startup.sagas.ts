import { all, takeLeading, put, select } from 'redux-saga/effects';
import { authActions } from '../auth';
import { reportError } from '../../shared/utils/reportError';
import { selectIsProfileStartupCompleted } from './startup.selectors';
import { startupActions } from '.';

export function* handleProfileStartup() {
  try {
    const isStartupCompleted = yield select(selectIsProfileStartupCompleted);
    if (!isStartupCompleted) {
      yield put(authActions.fetchProfile());
      yield put(startupActions.completeProfileStartup());
    }
  } catch (ex) {
    reportError(ex);
  }
}

export function* watchStartup() {
  yield all([takeLeading(startupActions.profileStartup, handleProfileStartup)]);
}
