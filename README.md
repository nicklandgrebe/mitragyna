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
  component={ConceptForm}
  subject={concept}
/>
```
