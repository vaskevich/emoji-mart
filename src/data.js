import data from '../data';

function renameProp(o, key, newKey, opt_default) {
  o[newKey] = o[key] || opt_default;
  delete o[key];
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

data.short_names = {};
data.emojis = {};

data.categories.forEach(category => {
  for (let i = 0; i < category.emojis.length; i++) {
    const datum = category.emojis[i];

    renameProp(datum, 'a', 'short_name')
    renameProp(datum, 'n', 'name')
    renameProp(datum, 'u', 'unified')
    renameProp(datum, 'v', 'variations', [])
    renameProp(datum, 'e', 'emoticons', [])
    renameProp(datum, 'k', 'keywords', [])
    renameProp(datum, 's', 'short_names', [])
    renameProp(datum, 't', 'skin_variations')

    data.emojis[datum.short_name] = datum;
    category.emojis[i] = datum.short_name;

    datum.short_names.forEach((short_name, i) => {
      if (i != 0) {
        data.short_names[short_name] = datum.short_name;
      }
    })

    datum.search = []
    addToSearch(datum, datum.short_names, true)
    addToSearch(datum, datum.name, true)
    addToSearch(datum, datum.keywords, false)
    addToSearch(datum, datum.emoticons, false)
    datum.search = datum.search.join(',')
  }
});

export default data
