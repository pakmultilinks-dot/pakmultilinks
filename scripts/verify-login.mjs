import assert from 'node:assert/strict';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const base = process.env.TEST_BASE_URL || 'http://localhost:3003';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Run login regression checks against a local development server only.');
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error('Local admin credentials must be configured.');
// Use an isolated local fingerprint so failure tests cannot lock out the developer.
const fingerprint = `local-login-test-${Date.now()}`;
async function login(valid) {
  return fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': fingerprint }, body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: valid ? process.env.ADMIN_PASSWORD : `invalid-${Date.now()}` }) });
}
for (let i = 0; i < 12; i++) assert.equal((await login(true)).status, 200, 'Successful logins must not accumulate toward lockout');
for (let i = 0; i < 6; i++) assert.equal((await login(false)).status, 401);
assert.equal((await login(true)).status, 200, 'A successful login must reset prior failures');
for (let i = 0; i < 8; i++) assert.equal((await login(false)).status, 401);
const blocked = await login(false);
assert.equal(blocked.status, 429, 'Repeated failures must still be limited');
const data = await blocked.json();
assert.ok(data.retryAfter > 0 && data.retryAfter <= 900);
assert.equal(Number(blocked.headers.get('Retry-After')), data.retryAfter);
console.log('PASS: 12 successful logins without lockout, failure counter reset after success, repeated failures blocked, and Retry-After header.');
