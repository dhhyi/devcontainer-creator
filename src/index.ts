import { logDone } from './logging';
import { BuildDevcontainer } from './tasks/build-devcontainer';
import { DumpDevcontainerMeta } from './tasks/devcontainer-meta';
import { ParsedArgs } from './tasks/parse-args';
import { TestDevcontainer } from './tasks/test-devcontainer';
import { WriteDevcontainer } from './tasks/write-devcontainer';

const { build, test, dumpMeta } = ParsedArgs();

await WriteDevcontainer();

if (dumpMeta) {
  await DumpDevcontainerMeta();
}

if (test) {
  await TestDevcontainer();
} else if (build) {
  await BuildDevcontainer();
}

logDone();
