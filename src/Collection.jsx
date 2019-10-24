import React from 'react';
import PropTypes from 'prop-types';
import ActiveResource from 'active-resource';
import _ from 'underscore';

export class Collection extends React.Component {
  static contextTypes = {
    resource: PropTypes.object,
    updateRoot: PropTypes.func
  }

  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.node,
    ]),
    className: PropTypes.string,
    blankComponent: PropTypes.func,
    component: PropTypes.func,
    componentProps: PropTypes.object,
    onBuild: PropTypes.func,
    onDelete: PropTypes.func,
    onReplace: PropTypes.func,
    readOnly: PropTypes.bool,
    subject: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
    ]).isRequired,
    reflection: PropTypes.string,
    wrapperComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    wrapperProps: PropTypes.object
  };

  static defaultProps = {
    inlineRows: false,
    wrapperComponent: 'section'
  };

  // link to global state by enabling afterLoad, afterAdd, afterRemove, afterUpdate callbacks that can call
  // an action linked to dispatch

  constructor() {
    super();

    this.state = {
      target: ActiveResource.Collection.build()
    };
  }

  componentDidMount() {
    this.setTarget(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setTarget(nextProps);
  }

  setTarget = ({ subject }) => {
    this.setState({ target: subject.target && subject.target() || subject })
  }

  buildResource = (arg) => {
    const { onBuild, reflection, subject } = this.props
    const { resource, updateRoot } = this.context

    if(resource) {
      updateRoot(resource[reflection]().build())
    } else {
      onBuild(arg)
    }
  }

  replaceResource = (newItem, oldItem) => {
    const { onReplace, reflection, subject } = this.props
    const { resource, updateRoot } = this.context

    if(resource) {
      const newResource = resource.clone()
      newResource[reflection]().target().replace(oldItem, newItem)
      updateRoot(newResource)
    } else {
      onReplace(newItem, oldItem)
    }
  }

  deleteResource = (item) => {
    const { onDelete, reflection, subject } = this.props
    const { resource, updateRoot } = this.context

    if(resource) {
      const newResource = resource.clone()
      newResource[reflection]().target().delete(item)
      updateRoot(newResource)
    } else {
      onDelete(item)
    }
  }

  render() {
    const { blankComponent, children, className, component, componentProps, readOnly, reflection, wrapperComponent, wrapperProps } = this.props;
    const { target } = this.state;

    const body =
      <React.Fragment>
        {
          target.size() > 0 ? (
            target.map((t, indexOf) =>
              <Resource
                afterDelete={this.deleteResource}
                afterUpdate={this.replaceResource}
                component={component}
                componentProps={{
                  ...componentProps,
                  indexOf
                }}
                key={t.id || (t.klass().className + '-' + indexOf)}
                readOnly={readOnly}
                reflection={reflection}
                subject={t}
              >
                {children}
              </Resource>
            ).toArray()
          ) : (blankComponent != null &&
            React.createElement(blankComponent)
          )
        }
      </React.Fragment>

    return React.createElement(
      wrapperComponent,
      {
        className,
        onBuild: this.buildResource,
        ...wrapperProps
      },
      body
    )
  }
}
