var fs = require('fs'),
    emojiData = require('emoji-datasource'),
    emojiLib = require('emojilib'),
    inflection = require('inflection'),
    mkdirp = require('mkdirp')

var categories = ['People', 'Nature', 'Foods', 'Activity', 'Places', 'Objects', 'Symbols', 'Flags'],
    data = { categories: [], skins: {} },
    categoriesIndex = {}

categories.forEach((category, i) => {
  data.categories[i] = { name: category, emojis: [] }
  categoriesIndex[category] = i
})

emojiData.sort((a, b) => {
  var aTest = a.sort_order || a.short_name,
      bTest = b.sort_order || b.short_name

  return aTest - bTest
})

function renameProp(o, key, newKey, deleteIfEmpty) {
  if (deleteIfEmpty && !o[key] || !o[key].length) {
    delete o[key];
  }

  if (o[key]) {
    o[newKey] = o[key];
    delete o[key];
  }
}

emojiData.forEach((datum) => {
  var category = datum.category,
      keywords = [],
      categoryIndex

  if (!datum.category) {
    throw new Error('“' + datum.short_name + '” doesn’t have a category')
  }

  datum.name || (datum.name = datum.short_name.replace(/\-/g, ' '))
  datum.name = inflection.titleize(datum.name || '')

  if (datum.category == 'Flags') {
    datum.name = datum.name.replace(/\s(\w+)$/, (letters) => letters.toUpperCase())
  }

  if (!datum.name) {
    throw new Error('“' + datum.short_name + '” doesn’t have a name')
  }

  datum.emoticons = datum.texts || []
  if (datum.text && !datum.emoticons.length) {
    datum.emoticons = [datum.text]
  }

  delete datum.text
  delete datum.texts

  if (emojiLib.lib[datum.short_name]) {
    keywords = emojiLib.lib[datum.short_name].keywords
  }

  datum.keywords = keywords

  if (datum.category == 'Skin Tones') {
    data.skins[datum.short_name] = datum
  } else {
    categoryIndex = categoriesIndex[category]
    data.categories[categoryIndex].emojis.push(datum)
  }

  delete datum.docomo
  delete datum.au
  delete datum.softbank
  delete datum.google
  delete datum.image
  delete datum.has_img_apple
  delete datum.has_img_google
  delete datum.has_img_twitter
  delete datum.has_img_emojione
  delete datum.sheet_x
  delete datum.sheet_y
  delete datum.category
  delete datum.sort_order

  renameProp(datum, 'short_name', 'a')
  renameProp(datum, 'name', 'n')
  renameProp(datum, 'unified', 'u')
  renameProp(datum, 'variations', 'v', true)
  renameProp(datum, 'emoticons', 'e', true)
  renameProp(datum, 'keywords', 'k', true)
  renameProp(datum, 'short_names', 's', true)

  if (datum.skin_variations) {
    datum.skin_variations = {}
    renameProp(datum, 'skin_variations', 't')
  }
})

var flags = data.categories[categoriesIndex['Flags']];
flags.emojis.sort()

mkdirp('data', (err) => {
  if (err) throw err

  const stringifiedData = JSON.stringify(data).replace(/\"([A-Za-z_]+)\":/g, '$1:')
  fs.writeFile('data/index.js', `export default ${stringifiedData}`, (err) => {
    if (err) throw err
  })
})
