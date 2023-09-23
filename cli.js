#!/usr/bin/env node

async function main() {

  let cwd = '.';
  let conf = process.argv[2] || './config.yaml'
  conf = require('path').resolve(cwd, conf);
  require('./index')({ conf, cwd });
}

main().catch(e => console.error(e));