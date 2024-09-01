#!/usr/bin/env node
const { program } = require('commander');
const { resolve  } = require('path');

program
  .name('create-data-api-app')
  .description('Create a data API app')
  .version('1.3.1')
  .arguments('[cwd]', 'Source directory')
  .option('-c, --config <config>', 'Path to config file', './config.yaml')
  .option('-i, --info', 'print parsed configueation', false)
  .option('-n, --no_esm', 'not to use esm (default: false)', false)
  .action((cwd, { config, info, no_esm }) => {
    cwd = resolve(process.cwd(), cwd || '.');
    const conf = resolve(process.cwd(), config);

    const configParser = require('./config-parser');
    const configueation = configParser(conf);
    info && console.log(JSON.stringify(configueation, null, 2));

    if(!no_esm) {
      return require('./esm-index')(cwd, configueation);
    } else {
      return require('./index')(cwd, configueation);
    }
  });

program.parse();