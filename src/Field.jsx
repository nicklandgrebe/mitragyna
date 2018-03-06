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
    var val = resource[name];

    switch(type) {
      case 'radio':
      case 'select':
        val = val();
        return _.isNull(val) ? '' : val.id;
      default:
        return val || '';
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
    if (options.isEmpty()) {
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
