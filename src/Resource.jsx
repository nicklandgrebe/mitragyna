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
    afterUpdateRoot: PropTypes.func,
    isNestedResource: PropTypes.bool,
    root: PropTypes.object,
    updateRoot: PropTypes.func,
    updatingRoot: PropTypes.bool,
  };

  static childContextTypes = {
    afterUpdateRoot: PropTypes.func,
    isNestedResource: PropTypes.bool,
    queueChange: PropTypes.func,
    resource: PropTypes.object,
    root: PropTypes.object,
    updateRoot: PropTypes.func,
    updatingRoot: PropTypes.bool,
  };

  static defaultProps = {
    componentProps: {}
  };

  constructor(props, context) {
    super();

    _.bindAll(this,
      'assignChanges',
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
    }

    this.state = state;
  }

  componentWillReceiveProps(nextProps) {
    const { afterUpdate } = this.props;
    const { inverseReflection } = this.state;

    this.setState({ resource: nextProps.subject });

    if(afterUpdate && !inverseReflection) {
      this.setState({ updating: false });
      this.assignChanges();
    }
  }

  componentDidCatch(error) {
    return <p>{ error }</p>;
  }

  assignChanges() {
    const { root, updateRoot } = this.context;
    const { inverseReflection, queuedChanges, resource } = this.state;

    if(_.keys(queuedChanges).length == 0) return;

    var newResource = resource.assignAttributes(queuedChanges);

    this.setState({ queuedChanges: {} });

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

  queueChange(change) {
    const { afterUpdate } = this.props;
    const { inverseReflection, queuedChanges, resource, updating } = this.state;
    const { afterUpdateRoot, root, updatingRoot } = this.context;

    this.setState({
      queuedChanges: {
        ...queuedChanges,
        ...change
      }
    }, () => {
      if(afterUpdate || afterUpdateRoot) {
        if(inverseReflection) {
          if(!updatingRoot) this.assignChanges();
        } else {
          if(!updating) this.assignChanges();
        }
      } else {
        this.assignChanges();
      }
    });
  }

  getChildContext() {
    const { afterUpdate } = this.props;
    const { root } = this.context;
    const { resource, updating } = this.state;

    let childContext = {
      afterUpdateRoot: afterUpdate,
      isNestedResource: true,
      queueChange: this.queueChange,
      root: root || resource,
      resource,
      updateRoot: this.updateRoot,
      updatingRoot: updating,
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
