const fs = require("fs");
const zlib = require("zlib");
const https = require("https");
const expat = require("node-expat");

// CHANGE THIS so that it's your nation
const USER_NATION = "";

(async () => {
  const currentDate = new Date();
  const outfile = fs.createWriteStream(`minor_of_${currentDate.getUTCMonth() + 1}_${currentDate.getUTCDate()}_${currentDate.getUTCFullYear()}.xml`);
  const options = {headers: {"User-Agent": `Update_Tracker/1.0 (developer=aptenodytezizou@gmail.com; user=${USER_NATION})`}};
  const regionList = await listRegions();

  for await (const region of regionList) {
    console.log(region);
    await new Promise(resolve => {
      https.get(`https://www.nationstates.net/cgi-bin/api.cgi?region=${sanitize(region)}&q=lastupdate`, options, res => {
        if (res.statusCode !== 404) {
          const xmlParser = new expat.Parser("UTF-8");
          res.pipe(xmlParser);

          let saveData = false;
          xmlParser.on("startElement", name => {
            if (name === "LASTUPDATE") saveData = true;
          }).on("text", text => {
            const updateTime = new Date(text * 1000);
            const newXml = `<region="${region}">\n<time>${updateTime.getUTCHours()}:${updateTime.getUTCMinutes()}:${updateTime.getUTCSeconds()}</time>\n</region>\n`;
            if (saveData) outfile.write(newXml);
          }).on("endElement", () => {
            saveData = false;
          });

          res.on("end", () => {
            setTimeout(resolve, 600);
          });
        } else {
          console.log("Detected 404 response");
          setTimeout(resolve, 600);
        }
      });
    });
  }

  outfile.end();
})();

// Sanitize a region name so that it can be used in the API request
function sanitize(region) {
  return region.replace(/ /g, "_").toLowerCase();
}

// Just go through the regional data dump, and grab a list of all the region
// names
async function listRegions() {
  const decompressor = zlib.createGunzip();
  const xmlParser = new expat.Parser("UTF-8");
  let saveData = false;
  let nameData = "";
  const regionNameArray = [];

  return new Promise(resolve => {
    https.get("https://www.nationstates.net/pages/regions.xml.gz", res => {
      res.pipe(decompressor).pipe(xmlParser);

      xmlParser.on("startElement", name => {
        if (name === "NAME") saveData = name;
      }).on("text", text => {
        if (saveData) nameData += text;
      }).on("endElement", name => {
        saveData = false;
        if (name === "NAME") {
          regionNameArray.push(nameData);
          nameData = "";
        }
      }).on("close", () => {
        resolve(regionNameArray);
      });
    });
  });
}
