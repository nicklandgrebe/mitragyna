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
    const { blankComponent, children, className, component } = this.props;
    const { loading, target } = this.state;

    return (
      <section className={ className }>
        { loading ? (
          <span>Loading</span>
        ) : (
          target.size() > 0 ? (
            target.map((t) =>
              <Resource subject={ t } key={ t.localId } component= { component }
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

export class ErrorsFor extends React.PureComponent {
  static propTypes = {
    field: PropTypes.string,
  };

  static contextTypes = {
    root: PropTypes.object,
  };

  render() {
    const { root } = this.context;
    const { field } = this.props;

    if(_.size(root.errors().forField(field)) < 1) {
      return null;
    }

    return(
      <summary>
        {
          _.map(root.errors().forField(field),
            (message, code) => <p key={ code }>{ message }</p>
          )
        }
      </summary>
    );
  }
};

export class Field extends React.PureComponent {
  static contextTypes = {
    afterUpdate: PropTypes.func,
    resource: PropTypes.object,
  };

  static propTypes = {
    component: PropTypes.func,
    includeBlank: PropTypes.bool,
    name: PropTypes.string.isRequired,
    options: PropTypes.instanceOf(ActiveResource.Collection),
    optionsLabelKey: PropTypes.string,
    type: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string,
      PropTypes.number,
    ])
  };

  constructor() {
    super();

    _.bindAll(this,
      'handleChange',
      'handleUpdate',
      'renderInputComponent',
      'renderRadioComponent',
      'renderSelectComponent',
      'renderTextareaComponent',
    );
  }

  componentWillMount() {
    const { name, type } = this.props;
    const { resource } = this.context;

    // Set initial value to that of the resources
    this.setState({
      value: this.valueFor(type, resource, name)
    });
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { name, type } = nextProps;
    const { resource } = nextContext;

    this.setState({
      value: this.valueFor(type, resource, name)
    });
  }

  // TODO: Add support for non-resource options on select and radio
  valueFor(type, resource, name) {
    switch(type) {
      case 'radio':
      case 'select':
        var val = resource[name]();
        return _.isNull(val) ? '' : val.id;
      default:
        return resource[name] || '';
    }
  }

  componentFor(type) {
    switch(type) {
      case 'radio':
        return this.renderRadioComponent();
      case 'select':
        return this.renderSelectComponent();
      case 'textarea':
        return this.renderTextareaComponent();
      default:
        return this.renderInputComponent();
    }
  }

  render() {
    const { type } = this.props;

    return this.componentFor(type);
  }

  renderInputComponent() {
    const { component, name } = this.props;

    let inputProps = _.omit(this.props, _.keys(_.omit(Field.propTypes, 'type')));

    let finalComponent = component || 'input';
    return React.createElement(finalComponent, {
      ...inputProps,
      key: name,
      onBlur: this.handleUpdate,
      onChange: this.handleChange,
      value: this.state.value,
    });
  }

  renderRadioComponent() {
    const { component, name, value } = this.props;
    const { value: fieldValue } = this.state;

    if (_.isUndefined(value)) {
      throw 'Input type="radio" must have prop "value"';
    }

    let radioProps = _.omit(this.props, _.keys(_.omit(Field.propTypes, 'type')));

    let finalComponent = component || 'input';
    return React.createElement(finalComponent, {
      ...radioProps,
      checked: value.id == fieldValue,
      key: name,
      onBlur: this.handleUpdate,
      onChange: this.handleChange,
      value: value.id,
    });
  }

  renderSelectComponent() {
    const { component, includeBlank, name, options, optionsLabelKey } = this.props;

    let selectOptions = null;
    if (options.empty()) {
      throw 'Input type="select" must have options';
    } else {
      selectOptions = options.map((o) => <option key={o.localId} value={o.id}>{o[optionsLabelKey]}</option>);
      if (includeBlank) {
        selectOptions = selectOptions.unshift(<option key={-1} value=''></option>);
      }
    }

    let omittedKeys = component ? _.omit(Field.propTypes, 'type') : Field.propTypes;
    let selectProps = _.omit(this.props, _.keys(omittedKeys));

    let finalComponent = component || 'select';
    return React.createElement(finalComponent, {
      ...selectProps,
      key: name,
      onBlur: this.handleUpdate,
      onChange: this.handleChange,
      value: this.state.value,
    }, selectOptions.toArray());
  }

  renderTextareaComponent() {
    const { component, name } = this.props;

    let textareaProps = _.omit(this.props, _.keys(Field.propTypes));

    let finalComponent = component || 'textarea';
    return React.createElement(finalComponent, {
      ...textareaProps,
      key: name,
      onBlur: this.handleUpdate,
      onChange: this.handleChange,
      value: this.state.value,
    });
  }

  handleChange(e) {
    e.persist();

    this.setState({
      value: e.target.value
    });
  }

  handleUpdate(e) {
    e.persist();

    const { afterUpdate, resource } = this.context;
    const { name, type, options, value } = this.props;

    var newValue = e.target.value;

    switch(type) {
      case 'radio':
        newValue = value;
        break;
      case 'select':
        newValue = options.detect((o) => o.id === newValue);
        break;
    }

    afterUpdate(resource.assignAttributes({ [name]: newValue }));
  }
}

export class Resource extends React.PureComponent {
  static propTypes = {
    afterUpdate: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.node,
    ]),
    className: PropTypes.string,
    component: PropTypes.func,
    componentProps: PropTypes.object,
    onSubmit: PropTypes.func,
    reflection: PropTypes.string,
    subject: PropTypes.object.isRequired,
  };

  static contextTypes = {
    isNestedResource: PropTypes.bool,
    root: PropTypes.object,
    updateRoot: PropTypes.func,
  };

  static childContextTypes = {
    afterUpdate: PropTypes.func,
    isNestedResource: PropTypes.bool,
    resource: PropTypes.object,
    root: PropTypes.object,
    updateRoot: PropTypes.func,
  };

  static defaultProps = {
    componentProps: {}
  };

  constructor(props, context) {
    super();

    _.bindAll(this,
      'afterUpdate',
      'handleSubmit',
      'updateRoot'
    );

    const { root } = context;
    const { reflection, subject } = props;

    let state = { resource: subject };

    if(reflection) {
      var reflectionInstance = root.klass().reflectOnAssociation(reflection);
      if(_.isUndefined(reflectionInstance)) throw 'Reflection ' + reflection + ' not found.';
      var inverseReflection = reflectionInstance.inverseOf();
      if(_.isUndefined(inverseReflection)) throw 'Reflection ' + reflection + ' must have inverse.';

      state = {
        ...state,
        inverseReflection,
        reflection: reflectionInstance,
      };
    }

    this.state = state;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ resource: nextProps.subject });
  }

  componentDidCatch(error) {
    return <p>{ error }</p>;
  }

  afterUpdate(newResource) {
    const { root, updateRoot } = this.context;
    const { inverseReflection, resource } = this.state;

    if(inverseReflection) {
      var oldTarget = resource.association(inverseReflection.name).target;
      var newTarget = newResource.association(inverseReflection.name).target;

      if(inverseReflection.collection()) {
        // FIXME: Allow autosave inverseOf collection to appropriately handle multiple resources in the collection,
        //   not just the first. If changing multiple fields of resource quickly, root may not be found in oldTarget
        //   because it has already been replaced by a previous change
        // var index = oldTarget.indexOf(root);
        // var newRoot = newTarget.get(index);
        updateRoot(newTarget.first());
      } else {
        updateRoot(newTarget);
      }
    } else {
      this.updateRoot(newResource);
    }
  }

  getChildContext() {
    const { root } = this.context;
    const { resource } = this.state;

    let childContext = {
      afterUpdate: this.afterUpdate,
      isNestedResource: true,
      root: root || resource,
      resource,
      updateRoot: this.updateRoot
    };

    return childContext;
  }

  handleSubmit(e) {
    const { onSubmit } = this.props;
    const { resource } = this.state;

    if(!_.isUndefined(onSubmit)) {
      e.preventDefault();
      onSubmit(resource);
    }
  }

  render() {
    const { isNestedResource } = this.context;
    const { children, className, component, componentProps } = this.props;
    const { resource } = this.state;

    let body = null;
    if(component) {
      body = React.createElement(component, {
        ...componentProps,
        afterUpdate: this.afterUpdate,
        subject: resource
      });
    } else {
      body = children;
    }

    if(!isNestedResource) {
      body = <form onSubmit={ this.handleSubmit }>{ body }</form>;
    }

    return (
      <section className={ className }>
        { body }
      </section>
    );
  }

  updateRoot(newRoot, fromSave = false) {
    const { afterUpdate } = this.props;
    const { resource } = this.state;

    this.setState({ resource: newRoot });

    if(!_.isUndefined(afterUpdate)) afterUpdate(newRoot, resource);

    if(!fromSave) {
      newRoot.save((root) => this.updateRoot(root, true));
    }
  }
}
