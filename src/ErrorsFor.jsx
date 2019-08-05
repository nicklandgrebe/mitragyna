export class ErrorsFor extends React.Component {
  static propTypes = {
    component: PropTypes.func,
    errorComponent: PropTypes.func,
    errorProps: PropTypes.object,
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
    const { component, errorComponent, errorProps, field } = this.props;

    var errors = resource.errors().forField(field);

    if(errors.empty()) return null;

    let customProps = _.omit(this.props, _.keys(ErrorsFor.propTypes));

    let finalComponent = component || 'summary';
    return React.createElement(finalComponent, {
      ...customProps,
      key: field,
    },
      errors.map((error) => {
        if (errorComponent) {
          return React.createElement(
            errorComponent,
            {
              ...errorProps,
              key: error.code,
            },
            error.message
          )
        } else {
          return <span key={ error.code }>{ error.message }</span>
        }
      }).toArray()
    );
  }
};
