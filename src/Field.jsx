export class Field extends React.PureComponent {
  static contextTypes = {
    afterUpdate: PropTypes.func,
    resource: PropTypes.object,
  };

  static propTypes = {
    component: PropTypes.func,
    includeBlank: PropTypes.bool,
    name: PropTypes.string.isRequired,
    options: PropTypes.array,
    optionsLabelKey: PropTypes.string,
    type: PropTypes.string.isRequired,
  };

  constructor() {
    super();

    _.bindAll(this,
      'createInputElement',
      'createSelectElement',
      'handleChange',
      'handleUpdate',
    );
  }

  componentWillMount() {
    const { name, type } = this.props;
    const { resource } = this.context;

    // Set initial value to that of the resources
    this.setState({
      value: type == 'select' ? this.selectValueFor(resource[name]()) : (resource[name] || '')
    });
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { name, type } = nextProps;
    const { resource } = nextContext;

    this.setState({
      value: type == 'select' ? this.selectValueFor(resource[name]()) : (resource[name] || '')
    });
  }

  render() {
    const { name, type } = this.props;
    const { resource } = this.context;

    return (type === 'select') ? this.createSelectElement() : this.createInputElement();
  }

  createInputElement() {
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

  // TODO: Add support for non-resource options
  selectValueFor(resource) {
    return resource && resource.id || '';
  }

  createSelectElement() {
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
    }, selectOptions);
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
    const { name, type, options } = this.props;

    var value = e.target.value;

    if(type === 'select') {
      value = options.find((o) => o.id === value);
    }

    afterUpdate(resource.assignAttributes({ [name]: value }));
  }
}
