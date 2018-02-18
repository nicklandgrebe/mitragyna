export class Resource extends React.PureComponent {
  static propTypes = {
    afterUpdate: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.node,
    ]),
    className: PropTypes.string,
    component: PropTypes.func,
    inline: PropTypes.bool,
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
    inline: PropTypes.bool,
    isNestedResource: PropTypes.bool,
    resource: PropTypes.object,
    root: PropTypes.object,
    updateRoot: PropTypes.func,
  };

  static defaultProps = {
    inline: false
  };

  constructor(props, context) {
    super();

    _.bindAll(this,
      'afterUpdate',
      'updateRoot'
    );
  }

  componentWillMount() {
    const { root } = this.context;
    const { reflection, subject } = this.props;

    if(reflection) {
      var reflectionInstance = root.reflectOnAssociation(reflection);
      if(_.isUndefined(reflectionInstance)) throw 'Reflection ' + reflection + ' not found.';
      var inverseReflection = reflectionInstance.inverseOf();
      if(_.isUndefined(inverseReflection)) throw 'Reflection ' + reflection + ' must have inverse.';

      this.setState({
        inverseReflection,
        reflection: reflectionInstance,
      });
    } else {
      this.setState({ resource: subject });
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ resource: nextProps.subject });
  }

  afterUpdate(newResource) {
    const { updateRoot } = this.context;
    const { inverseReflection } = this.state;

    if(inverseReflection) {
      updateRoot(newResource.association(inverseReflection.name).target);
    } else {
      this.updateRoot(newResource);
    }
  }

  getChildContext() {
    const { root } = this.context;
    const { inline } = this.props;
    const { resource } = this.state;

    let childContext = {
      afterUpdate: this.afterUpdate,
      inline,
      isNestedResource: true,
      root: root || this,
      resource,
      updateRoot: this.updateRoot
    };

    return childContext;
  }

  render() {
    const { isNestedResource } = this.context;
    const { children, className, component } = this.props;
    const { resource } = this.state;

    let body = null;
    if(component) {
      body = React.createElement(component, { subject: resource });
    } else {
      body = children;
    }

    if(!isNestedResource) {
      body = <form>{ body }</form>;
    }

    return (
      <section className={ className }>
        { body }
      </section>
    );
  }

  updateRoot(newRoot, fromSave = false) {
    const { afterUpdate } = this.context;
    const { resource } = this.props;

    this.setState({ resource: newRoot });

    if(!_.isUndefined(afterUpdate)) afterUpdate(newRoot, resource);

    if(!fromSave) {
      newRoot.save((root) => this.updateRoot(root, true));
    }
  }
}
