Mitragyna.ErrorsFor = class ErrorsFor extends React.PureComponent {
  static propTypes = {
    attribute: PropTypes.string,
    resource: PropTypes.object.isRequired,
  };

  render() {
    const { attribute, resource } = this.props;

    if(_.size(resource.errors().forField(attribute)) < 1) {
      return null;
    }

    return(
      <p className='dark-red f6 mt2 mb0'>
        {
          _.map(resource.errors().forField(attribute),
            (message, code) => <span key={ code } className='db'>{ message }</span>
          )
        }
      </p>
    );
  }
};
