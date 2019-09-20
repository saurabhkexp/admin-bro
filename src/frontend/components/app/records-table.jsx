import React from 'react'
import PropTypes from 'prop-types'

import RecordInList from './record-in-list'
import RecordsTableHeader from './records-table-header'
import NoRecords from './no-records'
import { resourceType, recordType } from '../../types'

import Table from '../ui/table'
import PlaceholderInList from '../ui/placeholder-in-list'

const RecordsTable = (props) => {
  const { resource, records, actionPerformed, sortBy, direction, isLoading } = props
  if (!records.length) {
    return (<NoRecords resource={resource} />)
  }
  return (
    <Table>
      <RecordsTableHeader
        properties={resource.listProperties}
        titleProperty={resource.titleProperty}
        direction={direction}
        sortBy={sortBy}
      />
      <tbody>
        {isLoading
          ? [...Array(records.length || 1)].map(() => (
            <PlaceholderInList columns={resource.listProperties.length + 1} />
          ))
          : records.map(record => (
            <RecordInList
              record={record}
              resource={resource}
              key={record.id}
              actionPerformed={actionPerformed}
            />
          ))}
      </tbody>
    </Table>
  )
}

RecordsTable.propTypes = {
  resource: resourceType.isRequired,
  records: PropTypes.arrayOf(recordType).isRequired,
  actionPerformed: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  direction: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
}

export default RecordsTable
