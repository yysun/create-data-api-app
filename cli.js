#!/usr/bin/env node
const { program } = require('commander');
const { resolve  } = require('path');

program
  .name('create-data-api-app')
  .description('Create a data API app')
  .version('2.0.0')
  .arguments('[cwd]', 'Source directory')
  .option('-c, --config <config>', 'Path to config file', './config.yaml')
  .option('-i, --info', 'print parsed configueation', false)
  .option('-n, --no_npm_install', 'not to install packages (default: false)', false)
  .action((cwd, { config, info, no_npm_install }) => {
    cwd = resolve(process.cwd(), cwd || '.');
    const conf = resolve(process.cwd(), config);
    const configParser = require('./config-parser');
    const configueation = configParser(conf);
    info && console.log(JSON.stringify(configueation, null, 2));
    return require('./esm-index').default(cwd, configueation, no_npm_install);
  });

program.parse();