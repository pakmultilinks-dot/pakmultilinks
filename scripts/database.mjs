import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import { spawnSync } from 'node:child_process';
loadEnvConfig(process.cwd());
const command = process.argv[2];
if (!['push', 'generate', 'studio'].includes(command)) throw new Error('Use push, generate or studio');
const args = command === 'push' ? ['db', 'push'] : [command];
const result = spawnSync('npx', ['prisma', ...args], { stdio: 'inherit', env: process.env });
process.exit(result.status ?? 1);
