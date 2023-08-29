import { mockFetch } from "../test-setup";

export const mockFetchOk = (response: any) => {
  mockFetch.mockImplementationOnce(() =>
    Promise.resolve({
      json: () => Promise.resolve(response),
    })
  );
};

export const mockFetchGptOk = (response: string) => {
  mockFetchOk({
    usage: {
      prompt_tokens: 1,
      completion_tokens: 2,
      total_tokens: 3,
    },
    choices: [
      {
        message: {
          content: response,
        },
      },
    ],
  });
};

export const mockFetchGptFail = (errorMsg: string) => {
  mockFetch.mockImplementationOnce(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          error: {
            message: errorMsg,
          },
        }),
    })
  );
};

export const expectFetch = () => expect(mockFetch);

export const expectFetchBodyMatches = (regex: RegExp) =>
  expectFetch().toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      body: expect.stringMatching(regex),
    })
  );

type promptProps = { [k: string]: string };

export const testPrompt = (props: promptProps) => {
  let res = "";
  for (const k in props) {
    res += `${k}: ${props[k]}, `;
  }
  return res;
};
