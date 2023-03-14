import '@saas-boilerplate-app/webapp-core/tests/setupTests';
import axios from 'axios';

import { server } from './mocks/server';

// Establish API mocking before all tests.
beforeAll(() => server.listen());
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());

axios.defaults.adapter = require('axios/lib/adapters/http');

jest.mock('./shared/services/contentful/schema');
jest.mock('./shared/services/graphqlApi/schema');
