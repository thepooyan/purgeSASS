#!/usr/bin/env bun

import { purgeSASS } from "."


const args = process.argv;
if (!args[0] || !args[1]) throw new Error("Please provide both arguments.\npurgeSass [D://Example/*.html] [F://Example/*.scss]")

purgeSASS({content: [args[0]] , scss: [args[1]] })
