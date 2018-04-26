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
    const { blankComponent, children, className, component, componentProps, reflection } = this.props;
    const { loading, target } = this.state;

    return (
      <section className={ className }>
        { loading ? (
          <span>Loading</span>
        ) : (
          target.size() > 0 ? (
            target.map((t, index) =>
              <Resource afterUpdate={ this.replaceOnTarget }
                        component= { component } componentProps={ componentProps }
                        key={ t.id || (t.klass().className + '-' + index) }
                        reflection={reflection}
                        subject={ t }>


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

export class ErrorsFor extends React.Component {
  static propTypes = {
    component: PropTypes.func,
    field: PropTypes.string,
  };

  static contextTypes = {
    resource: PropTypes.object,
  };

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !(shallowEqual(this.props, nextProps) && shallowEqual(this.state, nextState) && shallowEqual(this.context, nextContext));
  }

  render() {
    const { resource } = this.context;
    const { component, field } = this.props;

    var errors = resource.errors().forField(field);

    if(errors.empty()) return null;

    let customProps = _.omit(this.props, _.keys(ErrorsFor.propTypes));

    let finalComponent = component || 'summary';
    return React.createElement(finalComponent, {
      ...customProps,
      key: field,
    },
      errors.map((error) => {
        return <span key={ error.code }>{ error.message }</span>
      }).toArray()
    );
  }
};

import classNames from 'classnames';
import shallowEqual from 'shallowequal';

export class Field extends React.Component {
  static contextTypes = {
    afterUpdate: PropTypes.func,
    resource: PropTypes.object,
  };

  static propTypes = {
    className: PropTypes.string,
    component: PropTypes.func,
    includeBlank: PropTypes.bool,
    name: PropTypes.string.isRequired,
    options: PropTypes.instanceOf(ActiveResource.Collection),
    optionsLabel: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    type: PropTypes.string.isRequired,
    uncheckedValue: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
      PropTypes.string,
      PropTypes.number,
    ]),
    invalidClassName: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
      PropTypes.string,
      PropTypes.number,
    ])
  };

  constructor() {
    super();

    _.bindAll(this,
      'classNames',
      'commonInputProps',
      'handleChange',
      'handleUpdate',
      'renderCheckboxComponent',
      'renderInputComponent',
      'renderRadioComponent',
      'renderSelectComponent',
      'renderTextareaComponent'
    );
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !(shallowEqual(this.props, nextProps) && shallowEqual(this.state, nextState) && shallowEqual(this.context, nextContext));
  }

  componentWillMount() {
    const { resource } = this.context;

    // Set initial value to that of the resources
    this.setState({
      value: this.valueFor(resource, this.props)
    });
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { resource } = nextContext;

    this.setState({
      value: this.valueFor(resource, nextProps)
    });
  }

  classNames() {
    const { className, invalidClassName, name } = this.props;
    const { resource } = this.context;

    return classNames(
      className,
      {
        [invalidClassName]: !resource.errors().forField(name).empty()
      }
    );
  }

  commonInputProps() {
    const { name } = this.props;

    return {
      className: this.classNames(),
      key: name,
      onBlur: this.handleUpdate,
      onChange: this.handleChange,
    }
  }

  componentFor(type) {
    switch(type) {
      case 'checkbox':
        return this.renderCheckboxComponent();
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

  // TODO: Add support for non-resource options on select and radio
  valueFor(resource, props) {
    const { name, type, uncheckedValue, value } = props;

    switch(type) {
      case 'checkbox':
        var resourceValue = resource[name];
        if(resourceValue == value) {
          return true;
        } else if(resourceValue == uncheckedValue || _.isUndefined(resourceValue) || _.isNull(resourceValue)) {
          return false;
        } else {
          throw 'Field ' + name + ' with value ' + resource[name] + ' does not match value or uncheckedValue for checkbox'
        }
      case 'radio':
      case 'select':
        var val = resource[name]();
        return val ? val.id : '';
      default:
        var val = resource[name];
        return (!_.isUndefined(val) && !_.isNull(val)) ? resource[name] : '';
    }
  }

  render() {
    const { type } = this.props;

    return this.componentFor(type);
  }

  renderCheckboxComponent() {
    const { component, name } = this.props;

    let checkboxProps = _.omit(this.props, _.keys(_.omit(Field.propTypes, 'type')));

    let finalComponent = component || 'input';
    return React.createElement(finalComponent, {
      ...checkboxProps,
      ...this.commonInputProps(),
      checked: this.state.value,
    });
  }

  renderInputComponent() {
    const { component, name } = this.props;

    let inputProps = _.omit(this.props, _.keys(_.omit(Field.propTypes, 'type')));

    let finalComponent = component || 'input';
    return React.createElement(finalComponent, {
      ...inputProps,
      ...this.commonInputProps(),
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
      ...this.commonInputProps(),
      checked: value.id == fieldValue,
      value: value.id,
    });
  }

  renderSelectComponent() {
    const { component, includeBlank, name, options, optionsLabel } = this.props;

    let selectOptions = null;
    if (options.empty()) {
      throw 'Input type="select" must have options';
    } else {
      selectOptions = options.map((o) => {
        return <option key={o.id} value={o.id}>
          {
            _.isString(optionsLabel) ? (
              o[optionsLabel]
            ) : (
              optionsLabel(o)
            )
          }
        </option>;
      });
      if (includeBlank) {
        selectOptions.unshift(<option key={-1} value=''></option>);
      }
    }

    let omittedKeys = component ? _.omit(Field.propTypes, 'type') : Field.propTypes;
    let selectProps = _.omit(this.props, _.keys(omittedKeys));

    let finalComponent = component || 'select';
    return React.createElement(finalComponent, {
      ...selectProps,
      ...this.commonInputProps(),
      value: this.state.value,
    }, selectOptions.toArray());
  }

  renderTextareaComponent() {
    const { component, name } = this.props;

    let textareaProps = _.omit(this.props, _.keys(_.omit(Field.propTypes, 'type')));

    let finalComponent = component || 'textarea';
    return React.createElement(finalComponent, {
      ...textareaProps,
      ...this.commonInputProps(),
      value: this.state.value,
    });
  }

  handleChange(e) {
    e.persist();

    const { type } = this.props;

    let value;

    switch(type) {
      case 'checkbox':
        value = e.target.checked;
        break;
      default:
        value = e.target.value;
    }

    this.setState({ value });
  }

  handleUpdate(e) {
    e.persist();

    const { afterUpdate, resource } = this.context;
    const { name, type, options, uncheckedValue, value } = this.props;

    var newValue = e.target.value;

    switch(type) {
      case 'checkbox':
        if(e.target.checked) {
          newValue = value;
        } else {
          newValue = uncheckedValue;
        }
        break;
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
    afterError: PropTypes.func,
    afterUpdate: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.node,
    ]),
    className: PropTypes.string,
    component: PropTypes.func,
    componentProps: PropTypes.object,
    onInvalidSubmit: PropTypes.func,
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
    e.preventDefault();

    const { onSubmit, onInvalidSubmit } = this.props;
    const { resource } = this.state;

    var onSubmitCallback = (resourceToSubmit) => {
      if(!_.isUndefined(onSubmit)) {
        onSubmit(resourceToSubmit);
      }
    };

    var onInvalidSubmitCallback = (invalidResource) => {
      if(!_.isUndefined(onInvalidSubmit)) {
        onInvalidSubmit(invalidResource);
      }
    };

    if(!_.isUndefined(this.componentRef.beforeSubmit)) {
      Promise.resolve(this.componentRef.beforeSubmit(resource)).then(onSubmitCallback).catch(onInvalidSubmitCallback)
    } else {
      onSubmitCallback(resource);
    }
  }

  render() {
    const { isNestedResource } = this.context;
    const { afterError, children, className, component, componentProps } = this.props;
    const { resource } = this.state;

    let body;
    if(component) {
      body = React.createElement(component, {
        ...componentProps,
        afterUpdate: this.afterUpdate,
        afterError,
        subject: resource,
        ref: (c) => { this.componentRef = c }
      });
    } else {
      body = children;
    }

    if(isNestedResource) {
      return (
        <section className={ className }>
          { body }
        </section>
      );
    } else {
      return <form className={className} onSubmit={ this.handleSubmit }>{ body }</form>;
    }
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
