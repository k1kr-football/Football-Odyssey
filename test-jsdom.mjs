import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('dist/index.html', 'utf8');

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", (err) => {
  console.log("JSDOM Error:", err);
});
virtualConsole.on("log", (log) => {
  console.log("JSDOM Log:", log);
});

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "http://localhost/",
  virtualConsole
});

setTimeout(() => {
  console.log("DOM body after 5s:", dom.window.document.body.innerHTML.substring(0, 500));
}, 5000);
