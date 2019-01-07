import React from 'react';
import PropTypes from 'prop-types';
import ActiveResource from 'active-resource';
import _ from 'underscore';

export class Collection extends React.PureComponent {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.node,
    ]),
    className: PropTypes.string,
    blankComponent: PropTypes.func,
    component: PropTypes.func,
    componentProps: PropTypes.object,
    subject: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
    ]).isRequired,
    reflection: PropTypes.string,
  };

  static defaultProps = {
    inlineRows: false
  };

  // link to global state by enabling afterLoad, afterAdd, afterRemove, afterUpdate callbacks that can call
  // an action linked to dispatch

  constructor() {
    super();

    this.state = {
      target: ActiveResource.prototype.Collection.build()
    };

    _.bindAll(this,
      'buildOnTarget',
      'cloneTarget',
      'replaceOnTarget',
      'removeFromTarget',
    );
  }

  componentDidMount() {
    this.setTarget(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setTarget(nextProps);
  }

  setTarget(props) {
    const { subject } = props;

    this.setState({ target: subject.target() })
  }

  buildOnTarget(attributes) {
    const { subject } = this.props;
    let target = this.cloneTarget();

    target.push(subject.build(attributes));

    this.setState({ target: target });
  }

  replaceOnTarget(newItem, oldItem) {
    let target = this.cloneTarget();

    target.replace(oldItem, newItem);

    return this.setState({ target });
  }

  removeFromTarget(item) {
    let target = this.cloneTarget();

    target.delete(item);

    return this.setState({ target });
  }

  cloneTarget() {
    return this.state.target.clone();
  }

  render() {
    const { blankComponent, children, className, component, componentProps, reflection } = this.props;
    const { target } = this.state;

    return (
      <section className={ className }>
        {
          target.size() > 0 ? (
            target.map((t, indexOf) =>
              <Resource afterUpdate={this.replaceOnTarget}
                        component={component} componentProps={{...componentProps, indexOf}}
                        key={t.id || (t.klass().className + '-' + indexOf)}
                        reflection={reflection}
                        subject={t}>


                {children}
              </Resource>
            ).toArray()
          ) : (blankComponent != null &&
            blankComponent()
          )
        }
      </section>
    );
  }
}
