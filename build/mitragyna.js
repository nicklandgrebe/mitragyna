(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'react', 'prop-types', 'active-resource', 'underscore', 'classnames', 'shallowequal'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('react'), require('prop-types'), require('active-resource'), require('underscore'), require('classnames'), require('shallowequal'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.react, global.propTypes, global.activeResource, global.underscore, global.classnames, global.shallowequal);
    global.mitragyna = mod.exports;
  }
})(this, function (exports, _react, _propTypes, _activeResource, _underscore, _classnames, _shallowequal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Resource = exports.Field = exports.ErrorsFor = exports.Collection = undefined;

  var _react2 = _interopRequireDefault(_react);

  var _propTypes2 = _interopRequireDefault(_propTypes);

  var _activeResource2 = _interopRequireDefault(_activeResource);

  var _underscore2 = _interopRequireDefault(_underscore);

  var _classnames2 = _interopRequireDefault(_classnames);

  var _shallowequal2 = _interopRequireDefault(_shallowequal);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var Collection = exports.Collection = function (_React$PureComponent) {
    _inherits(Collection, _React$PureComponent);

    // link to global state by enabling afterLoad, afterAdd, afterRemove, afterUpdate callbacks that can call
    // an action linked to dispatch

    function Collection() {
      _classCallCheck(this, Collection);

      var _this = _possibleConstructorReturn(this, (Collection.__proto__ || Object.getPrototypeOf(Collection)).call(this));

      _this.state = {
        target: _activeResource2.default.prototype.Collection.build()
      };

      _underscore2.default.bindAll(_this, 'buildOnTarget', 'cloneTarget', 'replaceOnTarget', 'removeFromTarget');
      return _this;
    }

    _createClass(Collection, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        this.setTarget(this.props);
      }
    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        this.setTarget(nextProps);
      }
    }, {
      key: 'setTarget',
      value: function setTarget(props) {
        var subject = props.subject;


        this.setState({ target: subject.target() });
      }
    }, {
      key: 'buildOnTarget',
      value: function buildOnTarget(attributes) {
        var subject = this.props.subject;

        var target = this.cloneTarget();

        target.push(subject.build(attributes));

        this.setState({ target: target });
      }
    }, {
      key: 'replaceOnTarget',
      value: function replaceOnTarget(newItem, oldItem) {
        var target = this.cloneTarget();

        target.replace(oldItem, newItem);

        return this.setState({ target: target });
      }
    }, {
      key: 'removeFromTarget',
      value: function removeFromTarget(item) {
        var target = this.cloneTarget();

        target.delete(item);

        return this.setState({ target: target });
      }
    }, {
      key: 'cloneTarget',
      value: function cloneTarget() {
        return this.state.target.clone();
      }
    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;

        var _props = this.props,
            blankComponent = _props.blankComponent,
            children = _props.children,
            className = _props.className,
            component = _props.component,
            componentProps = _props.componentProps,
            reflection = _props.reflection;
        var target = this.state.target;


        return _react2.default.createElement(
          'section',
          { className: className },
          target.size() > 0 ? target.map(function (t, indexOf) {
            return _react2.default.createElement(
              Resource,
              { afterUpdate: _this2.replaceOnTarget,
                component: component, componentProps: _extends({}, componentProps, { indexOf: indexOf }),
                key: t.id || t.klass().className + '-' + indexOf,
                reflection: reflection,
                subject: t },
              children
            );
          }).toArray() : blankComponent != null && blankComponent()
        );
      }
    }]);

    return Collection;
  }(_react2.default.PureComponent);

  Collection.propTypes = {
    children: _propTypes2.default.oneOfType([_propTypes2.default.array, _propTypes2.default.node]),
    className: _propTypes2.default.string,
    blankComponent: _propTypes2.default.func,
    component: _propTypes2.default.func,
    componentProps: _propTypes2.default.object,
    subject: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func]).isRequired,
    reflection: _propTypes2.default.string
  };
  Collection.defaultProps = {
    inlineRows: false
  };

  var ErrorsFor = exports.ErrorsFor = function (_React$Component) {
    _inherits(ErrorsFor, _React$Component);

    function ErrorsFor() {
      _classCallCheck(this, ErrorsFor);

      return _possibleConstructorReturn(this, (ErrorsFor.__proto__ || Object.getPrototypeOf(ErrorsFor)).apply(this, arguments));
    }

    _createClass(ErrorsFor, [{
      key: 'shouldComponentUpdate',
      value: function shouldComponentUpdate(nextProps, nextState, nextContext) {
        return !((0, _shallowequal2.default)(this.props, nextProps) && (0, _shallowequal2.default)(this.state, nextState) && (0, _shallowequal2.default)(this.context, nextContext));
      }
    }, {
      key: 'render',
      value: function render() {
        var resource = this.context.resource;
        var _props2 = this.props,
            component = _props2.component,
            field = _props2.field;


        var errors = resource.errors().forField(field);

        if (errors.empty()) return null;

        var customProps = _underscore2.default.omit(this.props, _underscore2.default.keys(ErrorsFor.propTypes));

        var finalComponent = component || 'summary';
        return _react2.default.createElement(finalComponent, _extends({}, customProps, {
          key: field
        }), errors.map(function (error) {
          return _react2.default.createElement(
            'span',
            { key: error.code },
            error.message
          );
        }).toArray());
      }
    }]);

    return ErrorsFor;
  }(_react2.default.Component);

  ErrorsFor.propTypes = {
    component: _propTypes2.default.func,
    field: _propTypes2.default.string
  };
  ErrorsFor.contextTypes = {
    resource: _propTypes2.default.object
  };
  ;

  var Field = exports.Field = function (_React$Component2) {
    _inherits(Field, _React$Component2);

    function Field() {
      _classCallCheck(this, Field);

      var _this4 = _possibleConstructorReturn(this, (Field.__proto__ || Object.getPrototypeOf(Field)).call(this));

      _underscore2.default.bindAll(_this4, 'afterChange', 'changeRadio', 'classNames', 'commonInputProps', 'customInputProps', 'getValue', 'handleChange', 'renderCheckboxComponent', 'renderInputComponent', 'renderRadioComponent', 'renderSelectComponent', 'renderTextareaComponent', 'setValue', 'valueFor');

      _this4.state = {};
      return _this4;
    }

    _createClass(Field, [{
      key: 'shouldComponentUpdate',
      value: function shouldComponentUpdate(nextProps, nextState, nextContext) {
        return !((0, _shallowequal2.default)(this.props, nextProps) && (0, _shallowequal2.default)(this.state, nextState) && (0, _shallowequal2.default)(this.context, nextContext));
      }
    }, {
      key: 'getChildContext',
      value: function getChildContext() {
        var type = this.props.type;
        var value = this.state.value;


        switch (type) {
          case 'radioGroup':
            return {
              changeRadio: this.changeRadio,
              radioValue: value
            };
        }
      }
    }, {
      key: 'changeRadio',
      value: function changeRadio(value) {
        this.setState({ value: value });
      }
    }, {
      key: 'componentWillMount',
      value: function componentWillMount() {
        var type = this.props.type;
        var resource = this.context.resource;

        // Set initial value to that of the resources

        this.setState({
          resource: resource,
          value: this.valueFor(resource, this.props)
        });

        switch (type) {
          case 'email':
          case 'number':
          case 'text':
          case 'textarea':
            this.afterChange = _underscore2.default.debounce(this.afterChange, 500);
        }
      }
    }, {
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps, prevState) {
        var prevResource = prevState.resource;
        var resource = this.context.resource;


        if (prevResource !== resource) {
          this.setState({ resource: resource });
        }

        if (!(_underscore2.default.isNull(prevResource.id) || _underscore2.default.isUndefined(prevResource.id)) && prevResource.id !== resource.id) {
          this.setState({
            value: this.valueFor(resource, this.props)
          });
        }
      }
    }, {
      key: 'classNames',
      value: function classNames() {
        var _props3 = this.props,
            className = _props3.className,
            invalidClassName = _props3.invalidClassName,
            name = _props3.name;
        var resource = this.context.resource;


        return (0, _classnames2.default)(className, _defineProperty({}, invalidClassName, !resource.errors().forField(name).empty()));
      }
    }, {
      key: 'commonInputProps',
      value: function commonInputProps() {
        var name = this.props.name;


        var props = {
          className: this.classNames(),
          key: name,
          name: name,
          onChange: this.handleChange
        };

        return props;
      }
    }, {
      key: 'componentFor',
      value: function componentFor(type) {
        switch (type) {
          case 'checkbox':
            return this.renderCheckboxComponent();
          case 'radio':
            return this.renderRadioComponent();
          case 'radioGroup':
            return this.renderRadioGroupComponent();
          case 'select':
            return this.renderSelectComponent();
          case 'textarea':
            return this.renderTextareaComponent();
          default:
            return this.renderInputComponent();
        }
      }

      // @note type='radio' will pass down +name+ prop
      // @note type='select' will only pass down +type+ prop if +component+ prop is defined

    }, {
      key: 'customInputProps',
      value: function customInputProps() {
        var _props4 = this.props,
            component = _props4.component,
            type = _props4.type;


        var omittedProps;
        switch (type) {
          case 'radio':
            omittedProps = _underscore2.default.omit(Field.propTypes, ['type', 'name']);
            break;
          case 'select':
            omittedProps = component ? _underscore2.default.omit(Field.propTypes, 'type') : Field.propTypes;
            break;
          default:
            omittedProps = _underscore2.default.omit(Field.propTypes, 'type');
        }

        return _underscore2.default.omit(this.props, _underscore2.default.keys(omittedProps));
      }

      // TODO: Add support for non-resource options on select and radioGroup

    }, {
      key: 'valueFor',
      value: function valueFor(resource, props) {
        var name = props.name,
            type = props.type,
            uncheckedValue = props.uncheckedValue,
            value = props.value;


        switch (type) {
          case 'checkbox':
            var resourceValue = resource[name];
            if (resourceValue == value) {
              return true;
            } else if (resourceValue == uncheckedValue || _underscore2.default.isUndefined(resourceValue) || _underscore2.default.isNull(resourceValue)) {
              return false;
            } else {
              throw 'Field ' + name + ' with value ' + resource[name] + ' does not match value or uncheckedValue for checkbox';
            }
          case 'radioGroup':
          case 'select':
            var val = resource[name]();
            return val ? val.id : '';
          default:
            var val = resource[name];

            return val ? val : '';
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var type = this.props.type;


        return this.componentFor(type);
      }
    }, {
      key: 'renderCheckboxComponent',
      value: function renderCheckboxComponent() {
        var component = this.props.component;


        var finalComponent = component || 'input';
        return _react2.default.createElement(finalComponent, _extends({}, this.commonInputProps(), this.customInputProps(), {
          checked: this.state.value
        }));
      }
    }, {
      key: 'renderInputComponent',
      value: function renderInputComponent() {
        var component = this.props.component;


        var finalComponent = component || 'input';
        return _react2.default.createElement(finalComponent, _extends({}, this.commonInputProps(), this.customInputProps(), {
          value: this.state.value
        }));
      }
    }, {
      key: 'renderRadioComponent',
      value: function renderRadioComponent() {
        var _props5 = this.props,
            component = _props5.component,
            value = _props5.value;
        var radioValue = this.context.radioValue;


        if (_underscore2.default.isUndefined(value)) {
          throw 'Input type="radio" must have prop "value"';
        }

        var finalComponent = component || 'input';
        return _react2.default.createElement(finalComponent, _extends({}, this.commonInputProps(), this.customInputProps(), {
          checked: value.id == radioValue,
          value: value.id,
          name: value.questionId
        }));
      }
    }, {
      key: 'renderRadioGroupComponent',
      value: function renderRadioGroupComponent() {
        return _react2.default.createElement(
          'div',
          null,
          this.props.children
        );
      }
    }, {
      key: 'renderSelectComponent',
      value: function renderSelectComponent() {
        var _props6 = this.props,
            component = _props6.component,
            includeBlank = _props6.includeBlank,
            options = _props6.options,
            optionsLabel = _props6.optionsLabel;


        var selectOptions = null;
        if (options.empty()) {
          throw 'Input type="select" must have options';
        } else {
          selectOptions = options.map(function (o) {
            return _react2.default.createElement(
              'option',
              { key: o.id, value: o.id },
              _underscore2.default.isString(optionsLabel) ? o[optionsLabel] : optionsLabel(o)
            );
          });
          if (includeBlank) {
            selectOptions.unshift(_react2.default.createElement('option', { key: -1, value: '' }));
          }
        }

        var finalComponent = component || 'select';
        return _react2.default.createElement(finalComponent, _extends({}, this.commonInputProps(), this.customInputProps(), {
          value: this.state.value
        }), selectOptions.toArray());
      }
    }, {
      key: 'renderTextareaComponent',
      value: function renderTextareaComponent() {
        var component = this.props.component;


        var finalComponent = component || 'textarea';
        return _react2.default.createElement(finalComponent, _extends({}, this.commonInputProps(), this.customInputProps(), {
          value: this.state.value
        }));
      }
    }, {
      key: 'handleChange',
      value: function handleChange(e) {
        e.persist();

        var _props7 = this.props,
            max = _props7.max,
            min = _props7.min,
            type = _props7.type;
        var changeRadio = this.context.changeRadio;


        var value = void 0;

        switch (type) {
          case 'checkbox':
            value = e.target.checked;
            break;
          case 'number':
            if (e.target.value > max) {
              value = max;
            } else if (e.target.value < min) {
              value = min;
            } else {
              value = e.target.value || min;
            }

            break;
          case 'radio':
            changeRadio(e.target.value);
            break;
          default:
            value = e.target.value;
        }

        this.setState({ value: value }, this.afterChange);
      }
    }, {
      key: 'afterChange',
      value: function afterChange() {
        var _props8 = this.props,
            name = _props8.name,
            type = _props8.type,
            options = _props8.options,
            uncheckedValue = _props8.uncheckedValue,
            value = _props8.value;
        var stateValue = this.state.value;
        var queueChange = this.context.queueChange;


        var mappedValue = void 0;
        switch (type) {
          case 'checkbox':
            if (stateValue) {
              mappedValue = value;
            } else {
              mappedValue = uncheckedValue;
            }
            break;
          case 'radio':
            mappedValue = value;
            break;
          case 'select':
            mappedValue = options.detect(function (o) {
              return o.id === stateValue;
            });
            break;
          default:
            mappedValue = stateValue;
        }

        queueChange(_defineProperty({}, name, mappedValue));
      }
    }, {
      key: 'getValue',
      value: function getValue() {
        return this.state.value;
      }
    }, {
      key: 'setValue',
      value: function setValue(value) {
        var type = this.props.type;


        var mappedValue = { persist: _underscore2.default.noop };
        switch (type) {
          case 'checkbox':
            mappedValue = _extends({}, mappedValue, { target: { checked: value } });
            break;
          default:
            mappedValue = _extends({}, mappedValue, { target: { value: value } });
        }

        this.handleChange(mappedValue);
      }
    }]);

    return Field;
  }(_react2.default.Component);

  Field.contextTypes = {
    changeRadio: _propTypes2.default.func,
    queueChange: _propTypes2.default.func,
    radioValue: _propTypes2.default.any,
    resource: _propTypes2.default.object
  };
  Field.childContextTypes = {
    changeRadio: _propTypes2.default.func,
    radioValue: _propTypes2.default.any
  };
  Field.propTypes = {
    className: _propTypes2.default.string,
    component: _propTypes2.default.func,
    includeBlank: _propTypes2.default.bool,
    name: _propTypes2.default.string.isRequired,
    options: _propTypes2.default.instanceOf(_activeResource2.default.Collection),
    optionsLabel: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
    type: _propTypes2.default.string.isRequired,
    uncheckedValue: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func, _propTypes2.default.string, _propTypes2.default.number]),
    invalidClassName: _propTypes2.default.string,
    value: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.func, _propTypes2.default.string, _propTypes2.default.number])
  };

  var Resource = exports.Resource = function (_React$Component3) {
    _inherits(Resource, _React$Component3);

    function Resource(props, context) {
      _classCallCheck(this, Resource);

      var _this5 = _possibleConstructorReturn(this, (Resource.__proto__ || Object.getPrototypeOf(Resource)).call(this));

      _underscore2.default.bindAll(_this5, 'afterUpdate', 'assignChanges', 'queueReflectionChange', 'shiftReflectionQueue', 'queueChange', 'handleSubmit', 'updateRoot');

      var root = context.root;
      var reflection = props.reflection,
          subject = props.subject;


      var state = { resource: subject };

      if (reflection) {
        var reflectionInstance = root.klass().reflectOnAssociation(reflection);
        if (_underscore2.default.isUndefined(reflectionInstance)) throw 'Reflection ' + reflection + ' not found.';
        var inverseReflection = reflectionInstance.inverseOf();
        if (_underscore2.default.isUndefined(inverseReflection)) throw 'Reflection ' + reflection + ' must have inverse.';

        state = _extends({}, state, {
          inverseReflection: inverseReflection,
          queuedChanges: {},
          reflection: reflectionInstance,
          updating: false
        });
      } else {
        state = _extends({}, state, {
          queuedReflectionChanges: []
        });
      }

      _this5.beforeSubmit = props.beforeSubmit;
      _this5.state = state;
      return _this5;
    }

    _createClass(Resource, [{
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        var afterUpdate = this.props.afterUpdate;
        var inverseReflection = this.state.inverseReflection;
        var _context = this.context,
            afterUpdateRoot = _context.afterUpdateRoot,
            queuedReflectionChanges = _context.queuedReflectionChanges,
            shiftReflectionQueue = _context.shiftReflectionQueue;


        this.setState({ resource: nextProps.subject });

        if (afterUpdate && !inverseReflection) {
          this.setState({ updating: false });
          this.assignChanges();
        } else {
          if (afterUpdateRoot && inverseReflection && queuedReflectionChanges[0] === this) {
            shiftReflectionQueue();
            this.assignChanges();
          }
        }
      }
    }, {
      key: 'componentDidCatch',
      value: function componentDidCatch(error) {
        return _react2.default.createElement(
          'p',
          null,
          error
        );
      }
    }, {
      key: 'afterUpdate',
      value: function afterUpdate(newResource) {
        var updateRoot = this.context.updateRoot;
        var _state = this.state,
            inverseReflection = _state.inverseReflection,
            resource = _state.resource;


        if (inverseReflection) {
          var oldTarget = resource.association(inverseReflection.name).target;
          var newTarget = newResource.association(inverseReflection.name).target;

          if (inverseReflection.collection()) {
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
    }, {
      key: 'assignChanges',
      value: function assignChanges() {
        var _state2 = this.state,
            queuedChanges = _state2.queuedChanges,
            resource = _state2.resource;


        if (_underscore2.default.keys(queuedChanges).length == 0) return;

        var newResource = resource.assignAttributes(queuedChanges);

        this.setState({ queuedChanges: {} });

        this.afterUpdate(newResource);
      }
    }, {
      key: 'queueChange',
      value: function queueChange(change) {
        var _this6 = this;

        var afterUpdate = this.props.afterUpdate;
        var _state3 = this.state,
            inverseReflection = _state3.inverseReflection,
            queuedChanges = _state3.queuedChanges,
            updating = _state3.updating;


        this.setState({
          queuedChanges: _extends({}, queuedChanges, change)
        }, function () {
          var _context2 = _this6.context,
              afterUpdateRoot = _context2.afterUpdateRoot,
              queueReflectionChange = _context2.queueReflectionChange,
              updatingRoot = _context2.updatingRoot;


          if (afterUpdate || afterUpdateRoot) {
            if (inverseReflection) {
              if (updatingRoot) {
                queueReflectionChange(_this6);
              } else {
                _this6.assignChanges();
              }
            } else {
              if (!updating) _this6.assignChanges();
            }
          } else {
            _this6.assignChanges();
          }
        });
      }
    }, {
      key: 'queueReflectionChange',
      value: function queueReflectionChange(resource) {
        var queuedReflectionChanges = this.state.queuedReflectionChanges;


        queuedReflectionChanges.push(resource);
        this.setState({ queuedReflectionChanges: queuedReflectionChanges });
      }
    }, {
      key: 'shiftReflectionQueue',
      value: function shiftReflectionQueue() {
        var queuedReflectionChanges = this.state.queuedReflectionChanges;


        queuedReflectionChanges.shift();
        this.setState({ queuedReflectionChanges: queuedReflectionChanges });
      }
    }, {
      key: 'getChildContext',
      value: function getChildContext() {
        var afterUpdate = this.props.afterUpdate;
        var root = this.context.root;
        var _state4 = this.state,
            resource = _state4.resource,
            queuedReflectionChanges = _state4.queuedReflectionChanges,
            updating = _state4.updating;


        var childContext = {
          afterUpdateRoot: afterUpdate,
          isNestedResource: true,
          queueChange: this.queueChange,
          queuedReflectionChanges: queuedReflectionChanges,
          queueReflectionChange: this.queueReflectionChange,
          shiftReflectionQueue: this.shiftReflectionQueue,
          root: root || resource,
          resource: resource,
          updateRoot: this.updateRoot,
          updatingRoot: updating
        };

        return childContext;
      }
    }, {
      key: 'handleSubmit',
      value: function handleSubmit(e, callback) {
        if (e) e.preventDefault();

        var _props9 = this.props,
            onSubmit = _props9.onSubmit,
            onInvalidSubmit = _props9.onInvalidSubmit;
        var resource = this.state.resource;


        var onSubmitCallback = function onSubmitCallback(resourceToSubmit) {
          if (!_underscore2.default.isUndefined(onSubmit)) {
            onSubmit(resourceToSubmit);
          }

          if (!_underscore2.default.isUndefined(callback)) {
            callback(resourceToSubmit);
          }
        };

        var onInvalidSubmitCallback = function onInvalidSubmitCallback(invalidResource) {
          if (!_underscore2.default.isUndefined(onInvalidSubmit)) {
            onInvalidSubmit(invalidResource);
          }

          if (!_underscore2.default.isUndefined(callback)) {
            callback(invalidResource);
          }
        };

        var beforeSubmit = this.beforeSubmit || this.componentRef && this.componentRef.beforeSubmit;
        if (!_underscore2.default.isUndefined(beforeSubmit)) {
          new Promise(function (resolve, reject) {
            try {
              var result = beforeSubmit(resource);
              resolve(result);
            } catch (invalid) {
              reject(invalid);
            }
          }).then(onSubmitCallback).catch(onInvalidSubmitCallback);
        } else {
          onSubmitCallback(resource);
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var _this7 = this;

        var isNestedResource = this.context.isNestedResource;
        var _props10 = this.props,
            afterError = _props10.afterError,
            children = _props10.children,
            className = _props10.className,
            component = _props10.component,
            componentProps = _props10.componentProps,
            componentRef = _props10.componentRef;
        var resource = this.state.resource;


        var body = void 0;
        if (component) {
          body = _react2.default.createElement(component, _extends({}, componentProps, {
            afterUpdate: this.afterUpdate,
            afterError: afterError,
            onSubmit: this.handleSubmit,
            subject: resource,
            ref: function ref(c) {
              _this7.componentRef = c;componentRef(c);
            }
          }));
        } else {
          body = children;
        }

        if (isNestedResource) {
          return _react2.default.createElement(
            'section',
            { className: className },
            body
          );
        } else {
          return _react2.default.createElement(
            'form',
            { className: className, onSubmit: this.handleSubmit },
            body
          );
        }
      }
    }, {
      key: 'updateRoot',
      value: function updateRoot(newRoot) {
        var afterUpdate = this.props.afterUpdate;
        var resource = this.state.resource;


        this.setState({ resource: newRoot });

        if (afterUpdate) {
          afterUpdate(newRoot, resource);
          this.setState({ updating: true });
        }
      }
    }]);

    return Resource;
  }(_react2.default.Component);

  Resource.propTypes = {
    afterError: _propTypes2.default.func,
    afterUpdate: _propTypes2.default.func,
    children: _propTypes2.default.oneOfType([_propTypes2.default.array, _propTypes2.default.node]),
    className: _propTypes2.default.string,
    component: _propTypes2.default.func,
    componentProps: _propTypes2.default.object,
    onInvalidSubmit: _propTypes2.default.func,
    onSubmit: _propTypes2.default.func,
    reflection: _propTypes2.default.string,
    subject: _propTypes2.default.object.isRequired
  };
  Resource.contextTypes = {
    afterUpdateRoot: _propTypes2.default.func,
    isNestedResource: _propTypes2.default.bool,
    queuedReflectionChanges: _propTypes2.default.array,
    queueReflectionChange: _propTypes2.default.func,
    shiftReflectionQueue: _propTypes2.default.func,
    root: _propTypes2.default.object,
    updateRoot: _propTypes2.default.func,
    updatingRoot: _propTypes2.default.bool
  };
  Resource.childContextTypes = {
    afterUpdateRoot: _propTypes2.default.func,
    isNestedResource: _propTypes2.default.bool,
    queueChange: _propTypes2.default.func,
    queuedReflectionChanges: _propTypes2.default.array,
    queueReflectionChange: _propTypes2.default.func,
    shiftReflectionQueue: _propTypes2.default.func,
    resource: _propTypes2.default.object,
    root: _propTypes2.default.object,
    updateRoot: _propTypes2.default.func,
    updatingRoot: _propTypes2.default.bool
  };
  Resource.defaultProps = {
    componentProps: {},
    componentRef: _underscore2.default.noop
  };
});
