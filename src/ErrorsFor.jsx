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
