import data from '../data'

const COLONS_REGEX = /^(?:\:([^\:]+)\:)(?:\:skin-tone-(\d)\:)?$/
const SKINS = ['1F3FB', '1F3FC', '1F3FD', '1F3FE', '1F3FF']

function unifiedToNative(unified) {
  var unicodes = unified.split('-'),
      codePoints = unicodes.map((u) => `0x${u}`)

  return String.fromCodePoint(...codePoints)
}

function sanitize(emoji, {skin, includeSkinVariations = false, includeShortcuts = false} = {}) {
  var { name, short_names, skin_tone, skin_variations, emoticons, unified } = emoji,
      id = short_names[0],
      colons = `:${id}:`

  if (skin_tone) {
    colons += `:skin-tone-${skin_tone}:`
  }

  const result = {
    id,
    name,
    colons,
    emoticons,
    unified: unified.toLowerCase(),
    skin: skin_tone || (skin_variations ? 1 : null),
    native: unifiedToNative(unified),
  }

  if (includeSkinVariations && skin_variations) {
    result.skinVariations = SKINS.map((_skin, index) => {
      const skinVariationUnified = getSkinVariationUnified(unified, index + 2).toLowerCase()
      return {unified: skinVariationUnified, native: unifiedToNative(skinVariationUnified)}
    });
  }

  if (includeShortcuts) {
    result.shortcuts = short_names.map(s => `:${s}:`)
  }

  return result
}

function getSanitizedData(emoji, {skin, includeSkinVariations = false, includeShortcuts = false} = {}) {
  return sanitize(getData(emoji, skin), {includeSkinVariations, includeShortcuts})
}

function getSkinVariationUnified(baseUnified, skin) {
  return `${baseUnified}-${SKINS[skin - 2]}`
}

function getData(emoji, skin) {
  var emojiData = {}

  if (typeof emoji == 'string') {
    let matches = emoji.match(COLONS_REGEX)

    if (matches) {
      emoji = matches[1]

      if (matches[2]) {
        skin = parseInt(matches[2])
      }
    }

    if (data.short_names.hasOwnProperty(emoji)) {
      emoji = data.short_names[emoji]
    }

    if (data.emojis.hasOwnProperty(emoji)) {
      emojiData = data.emojis[emoji]
    }
  } else if (emoji.id) {
    if (data.short_names.hasOwnProperty(emoji.id)) {
      emoji.id = data.short_names[emoji.id]
    }

    if (data.emojis.hasOwnProperty(emoji.id)) {
      emojiData = data.emojis[emoji.id]
      skin || (skin = emoji.skin)
    }
  }

  emojiData.emoticons || (emojiData.emoticons = [])
  emojiData.variations || (emojiData.variations = [])

  if (emojiData.skin_variations && skin > 1) {
    emojiData = JSON.parse(JSON.stringify(emojiData))
    emojiData.skin_tone = skin
    emojiData.unified = getSkinVariationUnified(emojiData.unified, skin)
    delete emojiData.variations;
  }

  if (emojiData.variations && emojiData.variations.length) {
    emojiData = JSON.parse(JSON.stringify(emojiData))
    emojiData.unified = emojiData.variations.shift()
  }

  return emojiData
}

function intersect(a, b) {
  var aSet = new Set(a),
      bSet = new Set(b),
      intersection = null

  intersection = new Set(
    [...aSet].filter(x => bSet.has(x))
  )

  return Array.from(intersection)
}

function deepMerge(a, b) {
  var o = {}

  for (let key in a) {
    let originalValue = a[key],
        value = originalValue

    if (b.hasOwnProperty(key)) {
      value = b[key]
    }

    if (typeof value === 'object') {
      value = deepMerge(originalValue, value)
    }

    o[key] = value
  }

  return o
}

export { getData, getSanitizedData, intersect, deepMerge, unifiedToNative }
