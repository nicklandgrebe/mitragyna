Mitragyna.Input = class Input extends React.PureComponent {
  static contextTypes = {
    afterUpdate: PropTypes.func,
    inline: PropTypes.bool,
    resource: PropTypes.object,
  };

  static propTypes = {
    includeBlank: PropTypes.bool,
    options: PropTypes.array,
    optionsLabelKey: PropTypes.string,
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
      value: type == 'select' ? this.selectValueFor(resource[name]()) : resource[name]
    });
  }

  render() {
    const { name, type } = this.props;
    const { inline, resource } = this.context;

    let input = (type === 'select') ? this.createSelectElement() : this.createInputElement();

    return React.createElement(inline ? 'span' : 'div', {}, [
      input, <Mitragyna.ErrorsFor attribute={ name } resource={ resource } key='errors' />
    ]);
  }

  createInputElement() {
    const { name } = this.props;

    return React.createElement('input', {
      ...this.props,
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
    const { includeBlank, name, options, optionsLabelKey } = this.props;

    let selectOptions = null;
    if (options.isEmpty()) {
      throw 'Input type="select" must have options';
    } else {
      selectOptions = options.map((o) => <option key={o.localId} value={o.id}>{o[optionsLabelKey]}</option>);
      if (includeBlank) {
        selectOptions = selectOptions.unshift(<option key={-1} value=''></option>);
      }
    }

    let selectProps = _.omit(this.props, _.keys(Input.propTypes));

    return React.createElement('select', {
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
