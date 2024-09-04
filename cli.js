#!/usr/bin/env node
const { program } = require('commander');
const path = require('path');
const { existsSync, copyFileSync } = require('fs');
const configParser = require('./config-parser');

program
  .name('create-data-api-app')
  .description('Create a data API app')
  .version('2.0.0')
  .arguments('[cwd]', 'Source directory')
  .option('-c, --config <config>', 'Path to config file', './config.yaml')
  .option('-i, --info', 'print parsed configueation', false)
  .option('-n, --no_npm_install', 'not to install packages (default: false)', false)
  .action((cwd, { config, info, no_npm_install }) => {
    cwd = path.resolve(process.cwd(), cwd || '.');
    const conf =path.resolve(cwd, config);
    if (!existsSync(conf)) {
      console.log(`Warning: Config file not found: ${path.relative(process.cwd(), conf)}. Creating an example`);
      const example_file = path.join(__dirname, 'config.yaml');
      copyFileSync(example_file, conf);
    }
    const configueation = configParser(conf);
    info && console.log(JSON.stringify(configueation, null, 2));
    return require('./esm-index').default(cwd, configueation, no_npm_install);
  });

program.parse();
