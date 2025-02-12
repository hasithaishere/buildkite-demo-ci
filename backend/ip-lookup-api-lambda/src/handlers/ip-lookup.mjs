export const getByIdHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }

  console.info('received:', event);

  const ip = event.pathParameters.ip;

  const ipData = {

  };

  const response = {
    statusCode: 200,
    body: JSON.stringify(ipData)
  };

  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}
