export class ErrorsFor extends React.PureComponent {
  static propTypes = {
    field: PropTypes.string,
  };

  static contextTypes = {
    root: PropTypes.object,
  };

  render() {
    const { root } = this.context;
    const { field } = this.props;

    if(_.size(root.errors().forField(field)) < 1) {
      return null;
    }

    return(
      <summary>
        {
          _.map(root.errors().forField(field),
            (message, code) => <p key={ code }>{ message }</p>
          )
        }
      </summary>
    );
  }
};
