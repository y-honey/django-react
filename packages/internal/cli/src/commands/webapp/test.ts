import { Flags } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { BaseCommand } from '../../baseCommand';

export default class WebappTest extends BaseCommand<typeof WebappTest> {
  static description = 'Runs all webapp tests';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  static flags = {
    watchAll: Flags.string({
      default: 'true',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(WebappTest);
    await initConfig(this, {});

    await runCommand('pnpm', [
      'nx',
      'run',
      'webapp:test',
      `--watchAll=${flags.watchAll}`,
    ]);
  }
}
