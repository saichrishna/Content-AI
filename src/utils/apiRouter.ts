const FLOWISE_BASE_URL = process.env.NEXT_PUBLIC_FLOWISE_LOCAL_URL;
const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_LOCAL_URL;
const BASEROW_BASE_URL = process.env.NEXT_PUBLIC_BASEROW_LOCAL_URL;

export const endpoints = {
  contentStrategist: `${FLOWISE_BASE_URL}/927cb193-a89b-446f-aad5-9f9d119db54d`,
  promptEngineer: `${FLOWISE_BASE_URL}/fc030d30-80a9-49c5-8d57-bbc5abcb86a8`,
  contentGenerator: `${FLOWISE_BASE_URL}/fdfb40b7-4de3-4667-9c9f-9c7850a3033f`,
  contentReviewer: `${FLOWISE_BASE_URL}/bd3e01d6-d440-4d94-8d8a-ab8bc9b2c28b`,
  imageGenerator: `${FLOWISE_BASE_URL}/f3c22dfd-8883-448f-ad44-90e1dd3325d0`,
  marketingLead: `${SERVER_BASE_URL}/marketingLead/`,
  socialMediaAgent: `${BASEROW_BASE_URL}/341222/?user_field_names=true`,
};
