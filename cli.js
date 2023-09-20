#!/usr/bin/env node

// const fs = require('fs');
// const path = require('path');
// const prompts = require('prompts')

async function main() {

  // let cwd = process.argv[2] || '.';
  // if (cwd === '.') {
  //   const opts = await prompts([{
  //     type: 'text',
  //     name: 'cwd',
  //     message: 'Please enter the directory of the app (leave blank to use current directory)'
  //   }]);
  //   cwd = opts.cwd;
  // }

  // require('./index')({ cwd });


  let conf = process.argv[2] || './config.yaml'
  require('./index')({ conf, cwd: './demo' });
}

main().catch(e => console.error(e));