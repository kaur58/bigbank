import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';

/** Pause execution until the user submits a line in the console. not used. only used while developing to catch edge cases i trying to figure out how game works */
export async function waitForEnter(message = 'Press Enter to continue…'): Promise<void> {
  const terminal = createInterface({ input: stdin, output: stdout });
  try {
    await terminal.question(message);
  } finally {
    terminal.close();
  }
}
