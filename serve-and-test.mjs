import express from 'express';
import { JSDOM, VirtualConsole } from 'jsdom';
const app = express();
app.use(express.static('dist'));
const server = app.listen(3002, async () => {
  console.log('Server running on 3002');
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("error", (err) => console.log("JSDOM Error:", err));
  virtualConsole.on("jsdomError", (err) => console.log("JSDOM Internal Error:", err));
  virtualConsole.on("log", (log) => console.log("JSDOM Log:", log));
  const dom = await JSDOM.fromURL("http://localhost:3002/", {
    runScripts: "dangerously",
    resources: "usable",
    virtualConsole
  });
  setTimeout(() => {
    console.log("HTML length:", dom.window.document.body.innerHTML.length);
    console.log("Root content:", dom.window.document.getElementById('root').innerHTML.substring(0, 500));
    server.close();
    process.exit(0);
  }, 5000);
});
