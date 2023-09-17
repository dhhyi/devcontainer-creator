import { logDone } from './logging';
import {
  BuildAndPushDevcontainer,
  BuildDevcontainer,
} from './tasks/build-devcontainer';
import { DumpDevcontainerMeta } from './tasks/devcontainer-meta';
import { ParsedArgs } from './tasks/parse-args';
import { RunDevcontainer } from './tasks/run-devcontainer';
import { TestDevcontainer } from './tasks/test-devcontainer';
import { WriteDevcontainer } from './tasks/write-devcontainer';

const { build, push, test, dumpMeta, run } = ParsedArgs();

await WriteDevcontainer();

if (test) {
  await TestDevcontainer();
}
if (push) {
  await BuildAndPushDevcontainer();
} else if (build) {
  await BuildDevcontainer();
}

if (dumpMeta) {
  await DumpDevcontainerMeta();
}

if (run) {
  await RunDevcontainer();
}

logDone();
