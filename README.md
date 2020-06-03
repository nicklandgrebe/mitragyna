# mitragyna
A React library for managing ActiveResource.js resources as components

## Resource

```
import { Field, Resource } from 'mitragyna'

const ConceptForm = () => {
  return (
    <>
      <Field
        name="description"
        type="text"
      />
    </>
  )
}

<Resource
  afterUpdate={saveConcept}
  component={ConceptForm}
  subject={concept}
/>
```

## Nested/Related Resources

### Singular

```
import { Field, Resource } from 'mitragyna'

const ConceptForm = ({ subject }) => {
  return (
    <>
      <Resource
        component={UserForm}
        reflection="user"
        subject={subject.user()}
      />
      <Field
        name="description"
        type="text"
      />
    </>
  )
}

const UserForm = () => {
  return (
    <>
       <Field
        name="username"
        type="text"
      />
    </>
  )
}

<Resource
  afterUpdate={saveConcept}
  component={ConceptForm}
  subject={concept}
/>
```

### Collection

```
import { Collection, Field, Resource } from 'mitragyna'

const ConceptForm = ({ subject }) => {
  return (
    <>
      <Field
        name="description"
        type="text"
      />
      <Collection
        component={ItemForm}
        reflection="items"
        subject={subject.items()}
      />
    </>
  )
}

const ItemForm = ({ onDelete }) => {
  return (
    <>
       <Button onClick={onDelete}>Delete</Button>
       <Field
        name="name"
        type="text"
      />
    </>
  )
}

<Resource
  afterUpdate={saveConcept}
  component={ConceptForm}
  subject={concept}
/>
```

## Resource capabilities

### Submit buttons

Fields in mitragyna call `afterUpdate` automatically. You can have `afterUpdate` save your resource, or you can have it update your local state instead with the new version of your resource, and use `afterSubmit` to save your resource:

```
import { Field, Resource } from 'mitragyna'

const ConceptForm = () => {
  return (
    <>
      <Field
        name="description"
        type="text"
      />
      <Button type="submit">Submit</Button>
    </>
  )
}

<Resource
  afterSubmit={saveConcept}
  afterUpdate={setConcept}
  component={ConceptForm}
  subject={concept}
/>
```

### Delete buttons

You can add a button that will delete your resource:

```
import { Field, Resource } from 'mitragyna'

const ConceptForm = ({ onDelete }) => {
  return (
    <>
      <Field
        name="description"
        type="text"
      />
      <Button onClick={onDelete}>Delete</Button>
    </>
  )
}

<Resource
  afterDelete={destroyConcept}
  afterUpdate={saveConcept}
  component={ConceptForm}
  subject={concept}
/>
```

### afterUpdate

You can use `afterUpdate` inside of a `Resource` if you want to have your form manipulate your `subject` in some custom way:

```
import { Field, Resource } from 'mitragyna'

const ConceptForm = ({ afterUpdate, subject }) => {
  const flagUser = () => {
    afterUpdate(subject.assignAttributes({ flag: true }))
  }

  return (
    <>
      <Field
        name="description"
        type="text"
      />
      <Button onClick={flagUser}>Flag</Button>
    </>
  )
}

<Resource
  afterSubmit={saveConcept}
  afterUpdate={setConcept}
  component={ConceptForm}
  subject={concept}
/>
```

### componentProps

Pass down props to the component rendered by `Resource` via `componentProps`:

```
import { Resource } from 'mitragyna'

const ConceptForm = ({ customValue }) => {
  return
}

<Resource
  afterUpdate={saveConcept}
  component={ConceptForm}
  componentProps={{
    customValue: 1
  }}
  subject={concept}
/>
```

## Field types

```

import { Input, Label } from 'reactstrap'

/* Text */
<Field
  component={Input}
  name="username"
  type="text"
/>


/* Textarea */
<Field
  component={Input}
  name="description"
  type="textarea"
/>

/* Checkbox */
<Label check>
  <Field
    component={Input}
    name="public"
    type="checkbox"
    uncheckedValue={false}
    value={true}
  />
  Public
</Label>

/* Select (value) */
<Field
  component={Input}
  includeBlank={!subject.item()}
  name="item"
  options={[
    [1, "Value 1"],
    [2, "Value 2"]
  ]}
  type="select"
/>

/* Select (relationship) */
<Field
  component={Input}
  includeBlank={!subject.item()}
  name="item"
  options={items} // ActiveResource.Collection of resources
  optionsLabel={item => item.name}
  type="select"
/>
```

## Field Errors

```
import { ErrorsFor, Field, Resource } from 'mitragyna'

const ConceptForm = () => {
  return (
    <>
      <Field
        name="description"
        type="text"
      />
      <ErrorsFor
        field="description"
      />
    </>
  )
}
```

## Collections

Collections can also be used outside of `Resource`, and you can provide it with props for managing its behavior and structure:

```
import { Collection, Field } from 'mitragyna'

import { ListGroup, ListGroupItem } from 'reactstrap'

/* Wrap Collection in a custom view */
const Items = ({ children, onBuild }) => {
  return <section>
    <ListGroup>
      {children}
    </ListGroup>
    <Button
      color="primary"
      onClick={onBuild}
    >
      Add new
    </Button>
  </section>
}

/* This will be passed in as `component` for a `<Resource>` for each item, unless `readOnly={true}`
const Item = ({ onClick, onDelete }) => {
  return <ListGroupItem
    onClick={onClick}
  >
    <Field
      name="description"
      type="text"
    />
  </ListGroupItem>
}

const EmptyCollectionWarning = () => {
  return <section>
    <p>There are no items</p>
  </section>
}

const items = await Concept.all()

const buildItem = () => {
  items.push(Concept.build())
}

const deleteItem = (item) => {
  await item.destroy()
  items.delete(item)
}

// Useful for immutable libraries
const replaceItem = (newItem, oldItem) => {
  items.replace(oldItem, newItem)
}

<Collection
  blankComponent={EmptyCollectionWarning}
  component={Item}
  componentProps={{
    onClick: /* handle click */
  }}
  onBuild={buildItem}
  onDelete={deleteItem}
  onReplace={replaceItem}
  readOnly={/* if false, do not wrap each item in subject in a <Resource> */}
  subject={items} // ActiveResource.Collection
  wrapperComponent={Items}
/>
```
