import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';

/** Pause execution until the user submits a line in the console. */
export async function waitForEnter(message = 'Press Enter to continue…'): Promise<void> {
  const terminal = createInterface({ input: stdin, output: stdout });
  try {
    await terminal.question(message);
  } finally {
    terminal.close();
  }
}
