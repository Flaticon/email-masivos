import { describe, it, expect, beforeEach } from 'vitest';
import { fetchMock } from 'vitest-fetch-mock';
import app from '@/index';


describe('POST /send-email', () => {
  beforeEach(() => {
    fetchMock.mockResponse(JSON.stringify({ success: true }), { status: 202 });
  });

  it('should reject empty email list', async () => {
    const res = await app.request('/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails: [] })
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'Debe enviar entre 1 y 150 correos.'
    });
  });
});
