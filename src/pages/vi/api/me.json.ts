import type { APIRoute } from 'astro';
import { profileJsonText } from '../../../data/api';

export const GET: APIRoute = () => {
  return new Response(profileJsonText('vi'), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
