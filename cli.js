#!/usr/bin/env node

const { program } = require('commander');
const { updateGitStatus, commitVersionUpdate, updateAndCommit } = require('./index');

program
  .version('1.0.0')
  .description('A tool to update version numbers in files based on semantic versioning');

program
  .command('status')
  .description('Update Git status file')
  .action(updateGitStatus);

program
  .command('commit')
  .description('Update version numbers and commit changes')
  .option('-M, --major', 'Increment major version')
  .option('-m, --minor', 'Increment minor version')
  .option('-p, --patch', 'Increment patch version (default)')
  .option('-t, --template <file>', 'Specify a template file to update')
  .action((options) => {
    let incrementType = 'patch';
    if (options.major) incrementType = 'major';
    else if (options.minor) incrementType = 'minor';
    commitVersionUpdate(incrementType, options.template);
  });

program
  .command('update-commit')
  .description('Update Git status, version numbers, and commit changes')
  .option('-M, --major', 'Increment major version')
  .option('-m, --minor', 'Increment minor version')
  .option('-p, --patch', 'Increment patch version (default)')
  .option('-t, --template <file>', 'Specify a template file to update')
  .action((options) => {
    let incrementType = 'patch';
    if (options.major) incrementType = 'major';
    else if (options.minor) incrementType = 'minor';
    updateAndCommit(incrementType, options.template);
  });

program.parse(process.argv);