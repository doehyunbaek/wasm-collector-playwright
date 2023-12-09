const fs = require("fs");
const crypto = require("crypto");
const { chromium } = require("playwright");

const directory = "./wasm/";
const wrapper = fs.readFileSync("./wrapper.js", "utf8");

function wasmFound(data) {
    //Use hash as filename for deduplication
    const filename = crypto.createHash("md5").update(data).digest("hex");
    fs.writeFileSync(directory + filename, Buffer.from(data, "base64"));
}

(async () => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.exposeFunction("wasmFound", source => wasmFound(source));
    await page.addInitScript(wrapper);
    await page.goto("https://playgameoflife.com/")

    //Wait a bit, to make sure the Wasm as chance to load
    await new Promise(done => setTimeout(done, 1000));
    await browser.close();
})();
