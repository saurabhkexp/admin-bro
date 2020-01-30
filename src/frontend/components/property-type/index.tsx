import React, { ReactNode } from 'react'
import { ReactComponentLike } from 'prop-types'
import ErrorBoundary from '../app/error-boundary'

import * as ArrayType from './array'
import * as MixedType from './mixed'

import * as defaultType from './default-type'
import * as boolean from './boolean'
import * as datetime from './datetime'
import * as richtext from './richtext'
import * as reference from './reference'
import * as textarea from './textarea'
import * as password from './password'
import { BasePropertyProps } from './base-property-props'
import { PropertyPlace } from '../../../backend/decorators/property-json.interface'
import { PropertyType } from '../../../backend/adapters/base-property'
import { Box } from '../design-system'

let globalAny: any = {}

try {
  globalAny = window
} catch (error) {
  if (error.message !== 'window is not defined') {
    throw error
  }
}

const types: Record<PropertyType, any> = {
  textarea,
  boolean,
  datetime,
  reference,
  password,
  date: datetime,
  richtext,
  string: defaultType,
  number: defaultType,
  float: defaultType,
  mixed: null,
}

type State = {
  isClient: boolean;
}

type Props = BasePropertyProps & {
  /**
   * Where given property should be rendered
   */
  where: PropertyPlace;
}

/**
 * Component which renders properties in all the places in the AdminBro UI. By all the
 * places I mean:
 * - **list**: on the List,
 * - **edit**: on default actions where user can modify the record like: {@link EditAction},
 * and {@link NewAction},
 * - **show**: on the default {@link ShowAction} where user can see the details of a record,
 * - **filter**: and finally on the sidebar filter,
 *
 * Based on the type of given property and where the property is rendered **BasePropertyComponent**
 * picks Component to use. That is how **date** fields are rendered as **datepicker**
 * or **boolean** values as **checkbox**'es.
 *
 * You can override default behavior by changing **components** param
 * for given property in **AdminBroOptions**. Take a look at the following example:
 *
 * ```
 * const AdminBro = require('admin-bro')
 * const ResourceModel = require('./resource-model')
 * const AdminBroOptions = {
 *   resources: [{
 *     resource: ResourceModel
 *     options: {
 *       properties: {
 *         name: {
 *           components: {
 *             show: AdminBro.bundle('./my-react-component'),
 *           },
 *         },
 *       },
 *     },
 *   }],
 * }
 * ```
 *
 * In the example above we are altering how **name** property will look
 * like on the {@link ShowAction}. When we will define **my-react-component.jsx** like this:
 *
 * ```
 * import React from 'react'
 * import PropertyInShow from 'admin-bro'
 *
 * const MyReactComponent = props => {
 *   const { record, property } = props
 *   const value = record.params[property.name] === 'foo' ? 'bar' : 'zoe'
 *   return (
 *     <PropertyInShow property={property}>
 *       {value}
 *     </PropertyInShow>
 *   )
 * }
 * ```
 *
 * When record value for given property (**name**) equals 'foo' we will render 'bar',
 * otherwise 'zoe'
 *
 * We also use {@link PropertyInShow} helper component to render field with a label that it looks
 * similar to already defined properties. For other places you can use
 * a different _wrapper components_:
 * - `edit`: {@link PropertyInEdit}
 * - `show`: {@link PropertyInShow}
 * - `filter`: {@link PropertyInFilter}
 * - `list`: doesn't have any special wrapper,
 *
 * In your components you have access to the following prop types:
 *
 * @component
 * @name BasePropertyComponent
 * @category Base
 * @example
 * const booleanProperty = {
 *   isTitle: false,
 *   name: 'awesome',
 *   isId: false,
 *   position: -1,
 *   label: 'I am awesome',
 *   type: 'boolean',
 * }
 *
 * const stringProperty = {
 *   isTitle: true,
 *   name: 'name',
 *   isId: false,
 *   position: -1,
 *   label: 'Name of a user',
 *   type: 'string',
 * }
 * // Resource is taken from the database
 * const resource = {
 *   id: 'User',
 *   name: 'User Model',
 *   titleProperty: 'name',
 *   resourceActions: [],
 *   listProperties: [booleanProperty, stringProperty],
 *   editProperties: [booleanProperty, stringProperty],
 *   showProperties: [booleanProperty, stringProperty],
 *   filterProperties: [booleanProperty, stringProperty],
 * }
 *
 * const record = {
 *   id: '1',
 *   title: 'John',
 *   params: {
 *     name: 'John',
 *     gender: 'male',
 *   },
 *   recordActions: [],
 * }
 *
 * return (
 *   <WrapperBox border>
 *     <BasePropertyComponent
 *       property={booleanProperty}
 *       resource={resource}
 *       where="edit"
 *       record={record}
 *     />
 *     <BasePropertyComponent
 *       property={stringProperty}
 *       resource={resource}
 *       where="edit"
 *       record={record}
 *     />
 *   </WrapperBox>
 * )
 */
export default class BasePropertyComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      isClient: false,
    }
  }

  componentDidMount(): void {
    this.setState({ isClient: true })
  }

  static DefaultType

  static Boolean

  static DateTime

  static RichText

  static Reference

  static TextArea

  static Password

  render(): ReactNode {
    const { property, resource, record, filter, where, onChange } = this.props
    const { isClient } = this.state

    const testId = `property-${where}-${property.name}`

    let Component: ReactComponentLike = (types[property.type] && types[property.type][where])
    || defaultType[where]

    if (property.components && property.components[where] && isClient) {
      const component = property.components[where]
      if (!component) {
        throw new Error(`there is no "${property.name}.components.${where}"`)
      }
      Component = globalAny.AdminBro.UserComponents[component]
      return (
        <ErrorBoundary>
          <Box data-testid={testId}>
            <Component
              property={property}
              resource={resource}
              record={record}
              filter={filter}
              onChange={onChange}
            />
          </Box>
        </ErrorBoundary>
      )
    }

    const Array = ArrayType[where]
    const Mixed = MixedType[where]

    if (property.isArray) {
      if (!Array) { return (<div />) }
      return (
        <Array
          {...this.props}
          ItemComponent={BasePropertyComponent}
        />
      )
    }

    if (property.type === 'mixed' && property.subProperties && property.subProperties.length) {
      if (!Mixed) { return (<div />) }
      return (
        <Mixed
          {...this.props}
          ItemComponent={BasePropertyComponent}
        />
      )
    }

    return (
      <ErrorBoundary>
        <Box data-testid={testId}>
          <Component
            property={property}
            resource={resource}
            record={record}
            filter={filter}
            onChange={onChange}
          />
        </Box>
      </ErrorBoundary>
    )
  }
}


function camelizePropertyType<T>(type: {[key: string]: T}): {[key: string]: T} {
  return {
    Edit: type.edit,
    Show: type.show,
    List: type.list,
    Filter: type.filter,
  }
}

BasePropertyComponent.DefaultType = camelizePropertyType(defaultType)
BasePropertyComponent.Boolean = camelizePropertyType(boolean)
BasePropertyComponent.DateTime = camelizePropertyType(datetime)
BasePropertyComponent.RichText = camelizePropertyType(richtext)
BasePropertyComponent.Reference = camelizePropertyType(reference)
BasePropertyComponent.TextArea = camelizePropertyType(textarea)
BasePropertyComponent.Password = camelizePropertyType(password)
