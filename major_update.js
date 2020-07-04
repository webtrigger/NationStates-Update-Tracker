const fs = require("fs");
const https = require("https");
const zlib = require("zlib");
const expat = require("node-expat");

const currentDate = new Date();
const decompressor = zlib.createGunzip();
const xmlParser = new expat.Parser("UTF-8");
// Create a new outfile of the format "major_of_<date>_<month>_<year>"
const outfile = fs.createWriteStream(`major_of_${currentDate.getUTCMonth() + 1}_${currentDate.getUTCDate()}_${currentDate.getUTCFullYear()}.xml`);

https.get("https://www.nationstates.net/pages/regions.xml.gz", res => {
  let saveData = false;
  res.pipe(decompressor).pipe(xmlParser);

  /*
    Basically, detect if either a name or lastupdate value comes up in the XML,
    and if it does, write it into the outfile stream as XML
  */
  xmlParser.on("startElement", name => {
    if (name === "NAME" || name === "LASTUPDATE") saveData = name;
  }).on("text", text => {
    if (saveData === "NAME") {
      outfile.write(`<region="${text}">\n`);
    } else if (saveData === "LASTUPDATE") {
      /*
        Create a new date object based off of the lastupdate seconds, and grab
        the relevant UTC times from the date object
      */
      const updateTime = new Date(text * 1000);
      outfile.write(`<time>${updateTime.getUTCHours()}:${updateTime.getUTCMinutes()}:${updateTime.getUTCSeconds()}</time>\n</region>\n`);
    }
  }).on("endElement", () => {
    /*
      Stop getting element values after the closing tag
      That way, we can properly re-check if the next value is either name or
      lastupdate
    */
    saveData = false;
  }).on("close", () => {
    outfile.end(); // We have to manually close the outfile stream
  });
});
