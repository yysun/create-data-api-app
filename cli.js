#!/usr/bin/env node
const { program } = require('commander');
const { resolve  } = require('path');

program
  .name('create-data-api-app')
  .description('Create a data API app')
  .version('1.1.6')
  .arguments('[cwd]', 'Source directory')
  .option('-c, --config <config>', 'Path to config file', './config.yaml')
  .option('-i, --info', 'print parsed configueation', false)
  // .option('-s, --serve', 'Serve the API', false)
  .action((cwd, { config, info }) => {
    cwd = resolve(process.cwd(), cwd || '.');
    const conf = resolve(process.cwd(), config);
    require('./index')({ conf, cwd, info });
  });

program.parse();