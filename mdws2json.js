#!/usr/bin/env node
const fs = require('fs');
const iconv = require('iconv-lite');
const readline = require('readline');
const csv = require('csv-parse/lib/sync')

var item,itemIndex=0,items=[],prevKey,prevItem;
var separator = "(1) = ";
var soorten = csv(fs.readFileSync(__dirname + "/archiefeenheidsoorten.csv"))

//detect character encoding
// const detectCharacterEncoding = require('detect-character-encoding');
// var encoding = detectCharacterEncoding(fs.readFileSync(filename)).encoding;

encoding = "win1251";

// if (encoding=="windows-1252") encoding = "win1251";
// else if (encoding=="ISO-8859-1") encoding = "iso-8859-1";
// else return console.error("Unsupported character encoding",encoding);

var lineReader = readline.createInterface({
  input: process.stdin.pipe(iconv.decodeStream(encoding)).pipe(iconv.encodeStream('utf-8')),
  // output: process.stdout,
  terminal: false
});

lineReader.on('line', function (str) {

    var r,key,val,aetID,aetCode,code;

    //extract key and value
    r = /^(.*)\(1\)\s=\s(.*)/.exec(str);
    key = r ? r[1] : null;
    val = r ? r[2] : null;

    //get aet
    r = /\s\[aet_id=(\d+)\]/.exec(val);
    aetID = r ? r[1] :  null;
    aetCode = aetID ? soorten.find(o => o[2] == aetID)[0].toLowerCase() : null;

    //detect empty line to solve issue #3
    if (str=="") { 
      console.warn("Warning: empty line, creating new empty item"); //mogelijk een VABK (verzameltoegang)
      nextItem();
    }

    //use aetCode or default to abk
    else if (key=="%0") {
      key = aetCode ? aetCode : "abk";
      nextItem(key,val);
    }

    //found extra (not the same) GUID -> create new item as fix
    else if (item && item["GUID"] && key && key.toUpperCase()=="GUID" && item["GUID"]!=val) {
      console.warn("Warning: found extra and different GUID in same item. Creating new item",val);
      nextItem();
      updateItem("GUID",val);
    }

    //skip items with unkown type at the top
    else if (!item && key && !soorten.find(o => o[0].toLowerCase() == key)) return console.warn("Warning: Skip unknown type at start",str);

    //multi-line value
    else if (item && !key) updateItem(prevKey,str); //multi-line

    //key is an existing type, so start a new item
    else if (soorten.find(o => o[0].toLowerCase() == key)) nextItem(key,val);

    //update the current item
    else {
      updateItem(key,val);
    }

});

lineReader.on('close', function (line) {
  if (item) saveItem();
  if (itemIndex>0) console.log(']');
});

function nextItem(key,val) {
  if (item) saveItem(); //save if there's currently an item being parsed (not header)
  item = {}; //create a new item
  if (key) item.aet = key; //don't add empty aet's caused by issue #3
  updateItem(key,val); //add identifier such as ft=123 or krt=5
}

function saveItem() {
  if (!item) return console.error("Error: Skip saveItem because item is undefined");

  console.log(itemIndex++>0 ? "," : "[");
  console.log(JSON.stringify(item,null,4));

  prevItem = item;
}

//updateItem updates the current item with a key value pair
function updateItem(key,val) {
  if (key==undefined) return console.error("Error: Skip updateItem: key undefined, value="+val);
  else if (val==undefined) return console.error("Error: Skip updateItem: value undefined, key="+key);
  else if (item==undefined) return console.error("Error: Skip updateItem: item is undefined:",key,val);
  else if (key.indexOf(separator)>-1) return console.error("Error: Skip updateItem: Missing line break between fields:",key,val);

  if (key=="guid") key="GUID"; //always write GUID in uppercase
  
  if (key==item.aet && val) item.code = val.replace(/\[FASTUPLOAD\]\s|\[MODE=UPDATE2\]|\s\[aet_id=\d*\]/g,""); 
  else if (item && val) {
      if (!item[key]) item[key] = val; //store single item
      else if (item[key]==val || (Array.isArray(item[key]) && item[key].indexOf(val)>-1)) console.warn("Warning: ignoring second occurence of",key,"=",val,"for",item.GUID || item.id); // ignore second occurence of key value pair. issue #9
      else {
        if (!Array.isArray(item[key])) item[key] = [ item[key] ]; //convert to array when key already exists
        item[key].push(val);
      } 
  }
  prevKey = key;
}
