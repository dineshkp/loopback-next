import {execSync} from 'child_process';
import path from 'path';

const cliPath = path.resolve(
  __dirname,
  '../../../../../packages/cli/bin/cli-main.js',
);

export function cli(...args: string[]) {
  execSync(`node ${cliPath} -- ${args.join(' ')}`);
}
