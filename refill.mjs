#!/usr/bin/env node
// Standalone refill script for Railway cron
import { execSync } from 'child_process';

process.chdir('server');
execSync('npm run refill:treasury', { stdio: 'inherit' });
