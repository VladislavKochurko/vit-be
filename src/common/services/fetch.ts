import fetch, { BodyInit as BodyReq, HeadersInit as HeaderReq } from 'node-fetch';

export default async function httpRequest<T>(url: string,
  headers: HeaderReq = {},
  method: string = 'GET',
  body: BodyReq | null = null): Promise<T> {
  let reqBody: BodyReq | null = null;
  if (body) {
    reqBody = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { method, headers, body: reqBody });
  const data = await res.json() as T;

  if (!res.ok) {
    throw new Error('Something goes wrong');
  }

  return data;
}
