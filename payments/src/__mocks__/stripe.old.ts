export const stripe = {
  charges: {
    // mockResolvedValue : returns a promise with resolved value
    create: jest.fn().mockResolvedValue({}),
  },
};
