# Update-Tracker  

## Installation  
To install dependancies, run `npm i`. This will install the [node-expat](https://www.npmjs.com/package/node-expat) package, which is a C++ addon to node that needs to be compiled with [node-gyp](https://github.com/nodejs/node-gyp#installation).  

## Usage  
In the repo, two scripts are provided: `major_update.js` and `minor_update.js`. The former will download the latest data dump, and will pull the lastupdate times from the dump. The latter will grab a list of regions from the dumps, and use the lastupdate API shard to determine when it last updated.  

You can set these scripts to run after major and minor respectively by using something like [Crontab](https://crontab-generator.org/).  

After the script is run, it will produce an XML file titled `<major/minor>_of_<month>_<date>_<year>`. In this file, there will be a list of regions saved in the following format:
```xml
<region="Banana">
<time>16:0:21</time>
</region>
<region="Accommodators">
<time>16:0:22</time>
</region>
```
The time is in UTC 24 hour time, and is stored in the format of `<hours>:<minutes>:<seconds>`.
