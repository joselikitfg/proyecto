import { renderHook, act } from '@testing-library/react-hooks';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import useItems from '../../src/useItems';

describe('useItems', () => {
  let mock;
  const BASE_URL = "http://localhost:8082/items";
  const SEARCH_URL = `${BASE_URL}/search`;

  beforeAll(() => {
    mock = new MockAdapter(axios);
    
  });

  afterEach(() => {
    mock.reset();
  });

  it('should fetch items and handle success response', async () => {
    const items = [{ id: 1, name: 'Item 1' }];
    const BASE_URL = "http://localhost:8082/items";
    const SEARCH_URL = `${BASE_URL}/search`;
    mock.onGet(`${BASE_URL}?page=1&limit=12`).reply(200, { items, totalPages: 1 });

    const { result, waitForNextUpdate } = renderHook(() => useItems());

    await waitForNextUpdate();

    expect(result.current.items).toEqual(items);
    expect(result.current.totalPages).toEqual(1);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when fetching items fails', async () => {

    mock.onGet(`${BASE_URL}?page=1&limit=12`).networkError();

    const { result, waitForNextUpdate } = renderHook(() => useItems());

    await waitForNextUpdate();

    expect(result.current.error).toBeDefined();
  });

});
