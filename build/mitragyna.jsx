import React from 'react';
import PropTypes from 'prop-types';
import ActiveResource from 'active-resource';
import _ from 'underscore';

export class Collection extends React.PureComponent {
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
    wrapperComponent: PropTypes.oneOfType(PropTypes.func, PropTypes.string)
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

  setTarget({ subject }) {
    this.setState({ target: subject.target && subject.target() || subject })
  }

  buildResource = () => {
    const { onBuild, reflection, subject } = this.props
    const { resource, updateRoot } = this.context

    if(resource) {
      const newResource = resource[reflection]().build()
      updateRoot(newResource)
    } else {
      onBuild()
    }
  }

  replaceResource(newItem, oldItem) {
    const { onReplace, reflection, subject } = this.props
    const { resource, updateRoot } = this.context

    if(resource) {
      const newResource = resource.clone()
      resource[reflection]().target().replace(oldItem, newItem)
      updateRoot(newResource)
    } else {
      onReplace(newItem, oldItem)
    }
  }

  deleteResource(item) {
    const { onDelete, reflection, subject } = this.props
    const { resource, updateRoot } = this.context

    if(resource) {
      const newResource = resource.clone()
      resource[reflection]().target().delete(item)
      updateRoot(newResource)
    } else {
      onDelete(item)
    }
  }

  render() {
    const { blankComponent, children, className, component, componentProps, readOnly, reflection, wrapperComponent } = this.props;
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
        onBuild: this.buildResource
      },
      body
    )
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
    changeRadio: PropTypes.func,
    queueChange: PropTypes.func,
    radioValue: PropTypes.any,
    resource: PropTypes.object,
  };

  static childContextTypes = {
    changeRadio: PropTypes.func,
    radioValue: PropTypes.any,
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
      'afterChange',
      'changeRadio',
      'classNames',
      'commonInputProps',
      'customInputProps',
      'getValue',
      'handleChange',
      'renderCheckboxComponent',
      'renderInputComponent',
      'renderRadioComponent',
      'renderSelectComponent',
      'renderTextareaComponent',
      'setValue',
      'valueFor',
    );

    this.state = {};
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !(shallowEqual(this.props, nextProps) && shallowEqual(this.state, nextState) && shallowEqual(this.context, nextContext));
  }

  getChildContext() {
    const { type } = this.props;
    const { value } = this.state;

    switch(type) {
      case 'radioGroup':
        return {
          changeRadio: this.changeRadio,
          radioValue: value,
        };
    }
  }

  changeRadio(value) {
    this.setState({ value });
  }

  componentWillMount() {
    const { type } = this.props;
    const { resource } = this.context;

    // Set initial value to that of the resources
    this.setState({
      resource,
      value: this.valueFor(resource, this.props)
    });

    switch(type) {
      case 'email':
      case 'number':
      case 'text':
      case 'textarea':
        this.afterChange = _.debounce(this.afterChange, 500);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { resource: prevResource } = prevState
    const { resource } = this.context

    if(prevResource !== resource) {
      this.setState({ resource })
    }

    if(!(_.isNull(prevResource.id) || _.isUndefined(prevResource.id)) && prevResource.id !== resource.id) {
      this.setState({
        value: this.valueFor(resource, this.props)
      })
    }
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

    let props = {
      className: this.classNames(),
      key: name,
      name,
      onChange: this.handleChange,
    };

    return props;
  }

  componentFor(type) {
    switch(type) {
      case 'checkbox':
        return this.renderCheckboxComponent();
      case 'radio':
        return this.renderRadioComponent();
      case 'radioGroup':
        return this.renderRadioGroupComponent();
      case 'select':
        return this.renderSelectComponent();
      case 'textarea':
        return this.renderTextareaComponent();
      default:
        return this.renderInputComponent();
    }
  }

  // @note type='radio' will pass down +name+ prop
  // @note type='select' will only pass down +type+ prop if +component+ prop is defined
  customInputProps() {
    const { component, type } = this.props;

    var omittedProps;
    switch(type) {
      case 'radio':
        omittedProps = _.omit(Field.propTypes, ['type', 'name']);
        break;
      case 'select':
        omittedProps = component ? _.omit(Field.propTypes, 'type') : Field.propTypes;
        break;
      default:
        omittedProps = _.omit(Field.propTypes, 'type');
    }

    return _.omit(this.props, _.keys(omittedProps));
  }

  // TODO: Add support for non-resource options on select and radioGroup
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
      case 'radioGroup':
      case 'select':
        var val = resource[name]();
        return val ? val.id : '';
      default:
        var val = resource[name];

        return val ? val : '';
    }
  }

  render() {
    const { type } = this.props;

    return this.componentFor(type);
  }

  renderCheckboxComponent() {
    const { component } = this.props;

    let finalComponent = component || 'input';
    return React.createElement(finalComponent, {
      ...this.commonInputProps(),
      ...this.customInputProps(),
      checked: this.state.value,
    });
  }

  renderInputComponent() {
    const { component } = this.props;

    let finalComponent = component || 'input';
    return React.createElement(finalComponent, {
      ...this.commonInputProps(),
      ...this.customInputProps(),
      value: this.state.value,
    });
  }

  renderRadioComponent() {
    const { component, value } = this.props;
    const { radioValue } = this.context;

    if (_.isUndefined(value)) {
      throw 'Input type="radio" must have prop "value"';
    }

    let finalComponent = component || 'input';
    return React.createElement(finalComponent, {
      ...this.commonInputProps(),
      ...this.customInputProps(),
      checked: value.id == radioValue,
      value: value.id,
      name: value.questionId
    });
  }

  renderRadioGroupComponent() {
    return <div>
      { this.props.children }
    </div>;
  }

  renderSelectComponent() {
    const { component, includeBlank, options, optionsLabel } = this.props;

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

    let finalComponent = component || 'select';
    return React.createElement(finalComponent, {
      ...this.commonInputProps(),
      ...this.customInputProps(),
      value: this.state.value,
    }, selectOptions.toArray());
  }

  renderTextareaComponent() {
    const { component } = this.props;

    let finalComponent = component || 'textarea';
    return React.createElement(finalComponent, {
      ...this.commonInputProps(),
      ...this.customInputProps(),
      value: this.state.value,
    });
  }

  handleChange(e) {
    e.persist();

    const { max, min, type } = this.props;
    const { changeRadio } = this.context;

    let value;

    switch(type) {
      case 'checkbox':
        value = e.target.checked;
        break;
      case 'number':
        if(e.target.value > max) {
          value = max;
        } else if(e.target.value < min) {
          value = min;
        } else {
          value = e.target.value || min;
        }

        break;
      case 'radio':
        changeRadio(e.target.value);
        break;
      default:
        value = e.target.value;
    }

    this.setState({ value }, this.afterChange);
  }

  afterChange() {
    const { name, type, options, uncheckedValue, value } = this.props;
    const { value: stateValue } = this.state;
    const { queueChange } = this.context;

    let mappedValue;
    switch(type) {
      case 'checkbox':
        if(stateValue) {
          mappedValue = value;
        } else {
          mappedValue = uncheckedValue;
        }
        break;
      case 'radio':
        mappedValue = value;
        break;
      case 'select':
        mappedValue = options.detect((o) => o.id === stateValue);
        break;
      default:
        mappedValue = stateValue;
    }

    queueChange({ [name]: mappedValue });
  }

  getValue() {
    return this.state.value;
  }

  setValue(value) {
    const { type } = this.props;

    let mappedValue = { persist: _.noop };
    switch(type) {
      case 'checkbox':
        mappedValue = { ...mappedValue, target: { checked: value } };
        break;
      default:
        mappedValue = { ...mappedValue, target: { value } };
    }

    this.handleChange(mappedValue);
  }
}

export class Resource extends React.PureComponent {
  static propTypes = {
    afterDelete: PropTypes.func,
    afterError: PropTypes.func,
    afterUpdate: PropTypes.func,
    className: PropTypes.string,
    component: PropTypes.func.isRequired,
    componentProps: PropTypes.object,
    onInvalidSubmit: PropTypes.func,
    onSubmit: PropTypes.func,
    readOnly: PropTypes.bool,
    reflection: PropTypes.string,
    subject: PropTypes.object.isRequired,
  };

  static contextTypes = {
    afterUpdateRoot: PropTypes.func,
    isNestedResource: PropTypes.bool,
    queuedReflectionChanges: PropTypes.array,
    queueReflectionChange: PropTypes.func,
    shiftReflectionQueue: PropTypes.func,
    root: PropTypes.object,
    updateRoot: PropTypes.func,
    updatingRoot: PropTypes.bool,
  };

  static childContextTypes = {
    afterUpdateRoot: PropTypes.func,
    isNestedResource: PropTypes.bool,
    queueChange: PropTypes.func,
    queuedReflectionChanges: PropTypes.array,
    queueReflectionChange: PropTypes.func,
    shiftReflectionQueue: PropTypes.func,
    resource: PropTypes.object,
    root: PropTypes.object,
    updateRoot: PropTypes.func,
    updatingRoot: PropTypes.bool,
  };

  static defaultProps = {
    componentProps: {},
    componentRef: _.noop,
  };

  constructor(props, context) {
    super();

    _.bindAll(this,
      'afterUpdate',
      'assignChanges',
      'queueReflectionChange',
      'shiftReflectionQueue',
      'queueChange',
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
        queuedChanges: {},
        reflection: reflectionInstance,
        updating: false,
      };
    } else {
      state = {
        ...state,
        queuedReflectionChanges: []
      }
    }

    this.beforeSubmit = props.beforeSubmit;
    this.state = state;
  }

  componentWillReceiveProps(nextProps) {
    const { afterUpdate } = this.props;
    const { inverseReflection } = this.state;
    const { afterUpdateRoot, queuedReflectionChanges, shiftReflectionQueue } = this.context;

    this.setState({ resource: nextProps.subject });

    if(afterUpdate && !inverseReflection) {
      this.setState({ updating: false });
      this.assignChanges();
    } else {
      if(afterUpdateRoot && inverseReflection && queuedReflectionChanges[0] === this) {
        shiftReflectionQueue();
        this.assignChanges();
      }
    }
  }

  componentDidCatch(error) {
    return <p>{ error }</p>;
  }

  afterUpdate(newResource) {
    const { updateRoot } = this.context;
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

  assignChanges() {
    const { queuedChanges, resource } = this.state;

    if(_.keys(queuedChanges).length == 0) return;

    var newResource = resource.assignAttributes(queuedChanges);

    this.setState({ queuedChanges: {} });

    this.afterUpdate(newResource);
  }

  queueChange(change) {
    const { afterUpdate } = this.props;
    const { inverseReflection, queuedChanges, updating } = this.state;

    this.setState({
      queuedChanges: {
        ...queuedChanges,
        ...change
      }
    }, () => {
      const { afterUpdateRoot, queueReflectionChange, updatingRoot } = this.context;

      if(afterUpdate || afterUpdateRoot) {
        if(inverseReflection) {
          if(updatingRoot) {
            queueReflectionChange(this);
          } else {
            this.assignChanges();
          }
        } else {
          if(!updating) this.assignChanges();
        }
      } else {
        this.assignChanges();
      }
    });
  }

  queueReflectionChange(resource) {
    let { queuedReflectionChanges } = this.state;

    queuedReflectionChanges.push(resource);
    this.setState({ queuedReflectionChanges });
  }

  shiftReflectionQueue() {
    let { queuedReflectionChanges } = this.state;

    queuedReflectionChanges.shift();
    this.setState({ queuedReflectionChanges });
  }

  getChildContext() {
    const { afterUpdate } = this.props;
    const { root } = this.context;
    const { resource, queuedReflectionChanges, updating } = this.state;

    let childContext = {
      afterUpdateRoot: afterUpdate,
      isNestedResource: true,
      queueChange: this.queueChange,
      queuedReflectionChanges: queuedReflectionChanges,
      queueReflectionChange: this.queueReflectionChange,
      shiftReflectionQueue: this.shiftReflectionQueue,
      root: root || resource,
      resource,
      updateRoot: this.updateRoot,
      updatingRoot: updating,
    };

    return childContext;
  }

  handleDelete() {
    const { afterDelete, afterError } = this.props

    const { resource } = this.state

    resource.destroy()
    .then(() => {
      afterDelete && afterDelete(resource)
    })
    .catch((error) => {
      afterError && afterError(error)
    })
  }

  handleSubmit(e, callback) {
    if(e) e.preventDefault();

    const { onSubmit, onInvalidSubmit } = this.props;
    const { resource } = this.state;

    var onSubmitCallback = (resourceToSubmit) => {
      if(!_.isUndefined(onSubmit)) {
        onSubmit(resourceToSubmit);
      }

      if(!_.isUndefined(callback)) {
        callback(resourceToSubmit);
      }
    };

    var onInvalidSubmitCallback = (invalidResource) => {
      if(!_.isUndefined(onInvalidSubmit)) {
        onInvalidSubmit(invalidResource);
      }

      if(!_.isUndefined(callback)) {
        callback(invalidResource);
      }
    };

    let beforeSubmit = this.beforeSubmit || (this.componentRef && this.componentRef.beforeSubmit);
    if(!_.isUndefined(beforeSubmit)) {
      new Promise((resolve, reject) => {
        try {
          var result = beforeSubmit(resource);
          resolve(result);
        } catch(invalid) {
          reject(invalid);
        }
      }).then(onSubmitCallback).catch(onInvalidSubmitCallback)
    } else {
      onSubmitCallback(resource);
    }
  }

  render() {
    const { isNestedResource } = this.context;
    const { afterError, className, component, componentProps, componentRef, readOnly } = this.props;
    const { resource } = this.state;

    const isForm = !(isNestedResource || readOnly)

    let body = React.createElement(component, {
      ...componentProps,
      afterUpdate: this.afterUpdate,
      afterError,
      ...!isForm && { className },
      onDelete: this.handleDelete,
      onSubmit: this.handleSubmit,
      subject: resource,
      ref: (c) => { this.componentRef = c; componentRef(c) }
    });

    if(isForm) {
      return <form className={className} onSubmit={ this.handleSubmit }>{ body }</form>
    } else {
      return body
    }
  }

  updateRoot(newRoot) {
    const { afterUpdate } = this.props;
    const { resource } = this.state;

    this.setState({ resource: newRoot });

    if(afterUpdate) {
      afterUpdate(newRoot, resource);
      this.setState({ updating: true })
    }
  }
}
