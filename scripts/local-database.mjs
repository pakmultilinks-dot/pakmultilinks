import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import { spawnSync } from 'node:child_process';
loadEnvConfig(process.cwd());
const container = 'pakmultilinks-local-database';
if (!process.env.LOCAL_DB_PASSWORD) throw new Error('Set LOCAL_DB_PASSWORD in .env.local first.');
const env = { ...process.env, POSTGRES_PASSWORD: process.env.LOCAL_DB_PASSWORD };
function docker(args, capture = false) {
  return spawnSync('docker', args, { env, stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8' });
}
const exists = docker(['container', 'inspect', container, '--format', '{{index .Config.Labels "app"}}'], true);
if (exists.status === 0) {
  if (exists.stdout.trim() !== 'pakmultilinks-local') throw new Error('Container name is already in use by another application.');
  const start = docker(['start', container]);
  if (start.status !== 0) process.exit(start.status ?? 1);
} else {
  const run = docker(['run', '-d', '--name', container, '--label', 'app=pakmultilinks-local', '--restart', 'unless-stopped', '-p', '127.0.0.1:54329:5432', '-e', 'POSTGRES_USER=pakmultilinks', '-e', 'POSTGRES_DB=pakmultilinks', '-e', 'POSTGRES_PASSWORD', '-v', 'pakmultilinks-local-data:/var/lib/postgresql/data', 'postgres:17-alpine']);
  if (run.status !== 0) process.exit(run.status ?? 1);
}
for (let attempt = 0; attempt < 30; attempt++) {
  if (docker(['exec', container, 'pg_isready', '-U', 'pakmultilinks', '-d', 'pakmultilinks'], true).status === 0) {
    console.log('Local PostgreSQL is ready on 127.0.0.1:54329.'); process.exit(0);
  }
  await new Promise(resolve => setTimeout(resolve, 1000));
}
throw new Error('Database did not become ready; inspect the container logs.');
