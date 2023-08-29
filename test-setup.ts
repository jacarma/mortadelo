import { jest } from "@jest/globals";

(global as any).jest = jest;

export const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

jest.mock("./utils/file-utils");
