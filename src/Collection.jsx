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
    inlineRows: PropTypes.bool,
    rowClassName: PropTypes.string,
    subject: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
    ]).isRequired,
  };

  static defaultProps = {
    inlineRows: false
  };

  // link to global state by enabling afterLoad, afterAdd, afterRemove, afterUpdate callbacks that can call
  // an action linked to dispatch

  constructor() {
    super();

    this.state = {
      loading: true,
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

    let isRelationship = subject.isA(ActiveResource.prototype.Associations.prototype.CollectionProxy);

    let setLoadedTarget = (target) => {
      this.setState({ loading: false, target })
    };

    if(isRelationship) {
      if(subject.base.loaded()) {
        setLoadedTarget(subject.base.target)
      } else {
        subject.load()
        .then(setLoadedTarget)
      }
    } else if(!_.isUndefined(subject.all)) {
      subject.all()
      .then(setLoadedTarget)
    }
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
    const { blankComponent, children, className, component, inlineRows, rowClassName } = this.props;
    const { loading, target } = this.state;

    return (
      <section className={ className }>
        { loading ? (
          <span>Loading</span>
        ) : (
          target.size() > 0 ? (
            target.map((t) =>
              <Resource subject={ t } key={ t.localId } component= { component }
                        className={ rowClassName } inline={ inlineRows }
                        afterUpdate={ this.replaceOnTarget }>
                { children }
              </Resource>
            ).toArray()
          ) : (blankComponent != null &&
            blankComponent()
          )
        )}
      </section>
    );
  }
}
