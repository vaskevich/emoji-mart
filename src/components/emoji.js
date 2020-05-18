import React from 'react'
import PropTypes from 'prop-types'
import data from '../data'

import { getData, getSanitizedData, unifiedToNative } from '../utils'

const SHEET_COLUMNS = 41

export default class Emoji extends React.Component {
  constructor(props) {
    super(props)

    this.hasSkinVariations = !!this.getData().skin_variations
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.hasSkinVariations && nextProps.skin != this.props.skin ||
      nextProps.size != this.props.size ||
      nextProps.emoji != this.props.emoji
    )
  }

  getData() {
    var { emoji, skin } = this.props
    return getData(emoji, skin)
  }

  getSanitizedData() {
    var { emoji, skin } = this.props
    return getSanitizedData(emoji, {skin})
  }

  handleClick(e) {
    var { onClick } = this.props,
        emoji = this.getSanitizedData()

    onClick(emoji, e)
  }

  handleOver(e) {
    var { onOver } = this.props,
        emoji = this.getSanitizedData()

    onOver(emoji, e)
  }

  handleLeave(e) {
    var { onLeave } = this.props,
        emoji = this.getSanitizedData()

    onLeave(emoji, e)
  }

  render() {
    var { size, forceSize, onOver, onLeave } = this.props,
        { unified } = this.getData(),
        style = {},
        children = this.props.children

    if (!unified) {
      return null
    }

    style = { fontSize: size }
    children = unifiedToNative(unified)

    if (forceSize) {
      style.display = 'inline-block'
      style.width = size
      style.height = size
    }

    return <span
      onClick={this.handleClick.bind(this)}
      onMouseEnter={this.handleOver.bind(this)}
      onMouseLeave={this.handleLeave.bind(this)}
      className='emoji-mart-emoji emoji-mart-emoji-native'>
      <span style={style}>{children}</span>
    </span>
  }
}

Emoji.propTypes = {
  onOver: PropTypes.func,
  onLeave: PropTypes.func,
  onClick: PropTypes.func,
  forceSize: PropTypes.bool,
  skin: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  size: PropTypes.number.isRequired,
  emoji: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]).isRequired,
}

Emoji.defaultProps = {
  skin: 1,
  forceSize: false,
  onOver: (() => {}),
  onLeave: (() => {}),
  onClick: (() => {}),
}
