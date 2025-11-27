// __mocks__/@line/liff.ts
const liff = {
  init: jest.fn().mockResolvedValue(undefined),
  isLoggedIn: jest.fn(),
  getProfile: jest.fn(),
  ready: Promise.resolve(),
};

export default liff;