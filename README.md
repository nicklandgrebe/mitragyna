### Example 


1. Set a resource, and attach a child component to render with that subject

```jsx
<Resource component={Customer} reflection="customer" subject={customer} />
```

2. Have a field in the child component that responds to the subject from the parent Resource

```jsx
  // subject prop is present
  <Field
    type="email"
    name="email"
    id="email"
    component={Input}
    invalidClassName="is-invalid"
    placeholder="jane.doe@example.com"
  />
  <ErrorsFor className="customer-email-errors" component={FormFeedback} field="email" />
```

3. You can nest Resources with setting a reflection

```jsx
<Resource component={Customer} reflection="customer" subject={customer} />

```

4. Bind some callback logic to the (outer) resource

* afterError: PropTypes.func
* afterUpdate: PropTypes.func
* onInvalidSubmit: PropTypes.func
* onSubmit: PropTypes.func
* beforeSubmit: PropTypes.func
