import { VERBOSE } from './tasks/parse-args';

if (!process.stdout.clearLine) {
  console.time('dcc');
}

export function logStatus(...message: unknown[]) {
  if (VERBOSE) {
    console.log(...message);
  } else if (process.stdout.clearLine) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(message.join(' '));
  } else {
    console.timeLog('dcc', message?.join(' ')?.trim());
  }
}

export function logPersist(...message: unknown[]) {
  if (VERBOSE) {
    console.log(...message);
  } else if (process.stdout.clearLine) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.log(...message);
  } else {
    console.timeLog('dcc', ...message);
  }
}

export function logWarn(...message: unknown[]) {
  if (VERBOSE) {
    if (!process.stdout.clearLine) {
      console.log('::warning::', ...message);
    } else {
      console.warn(...message);
    }
  } else if (process.stdout.clearLine) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.warn(...message);
  } else {
    console.timeLog('dcc');
    console.log('::warning::', ...message);
  }
}

export function logError(...message: unknown[]) {
  console.log('\n\x1b[31m', ...message, '\x1b[0m');
}

export function logDone() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (process.stdout.clearLine) {
    logStatus('done\n');
  } else {
    console.timeEnd('dcc');
  }
}
