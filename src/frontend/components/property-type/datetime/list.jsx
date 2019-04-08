import React from 'react'
import { Link } from 'react-router-dom'
import ViewHelpers from '../../../../backend/utils/view-helpers'
import mapValue from './map-value'

export default class List extends React.PureComponent {
  render() {
    const { property, record, resource } = this.props
    const showAction = resource.recordActions.find(a => a.name === 'show')
    const value = mapValue(record.params[property.name])

    if (resource.titleProperty.name === property.name && showAction) {
      const h = new ViewHelpers()
      const href = h.recordActionUrl(resource.id, record.id, 'show')
      return (
        <Link to={href}>{value}</Link>
      )
    }

    return (
      <span>{value}</span>
    )
  }
}