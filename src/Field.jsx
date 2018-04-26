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
