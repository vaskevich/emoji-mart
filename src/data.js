import compressedData from '../data';
const LZString = require('lz-string');

const data = JSON.parse(LZString.decompressFromBase64(compressedData));

function renameProp(o, key, newKey) {
  if (o[key]) {
    o[newKey] = o[key];
    delete o[key];
  }
}

const addToSearch = (datum, strings, split) => {
  (Array.isArray(strings) ? strings : [strings]).forEach((string) => {
    (split ? string.split(/[-|_|\s]+/) : [string]).forEach((s) => {
      s = s.toLowerCase()

      if (datum.search.indexOf(s) == -1) {
        datum.search.push(s)
      }
    })
  })
}

for (let key in data.emojis) {
  if (data.emojis.hasOwnProperty(key)) {
    const datum = data.emojis[key];

    renameProp(datum, 'n', 'name')
    renameProp(datum, 'u', 'unified')
    renameProp(datum, 'v', 'variations')
    renameProp(datum, 'e', 'emoticons')
    renameProp(datum, 'k', 'keywords')
    renameProp(datum, 's', 'short_names')
    renameProp(datum, 't', 'skin_variations')

    datum.search = []
    addToSearch(datum, datum.short_names, true)
    addToSearch(datum, datum.name, true)
    addToSearch(datum, datum.keywords, false)
    addToSearch(datum, datum.emoticons, false)
    datum.search = datum.search.join(',')
  }
}

export default data
