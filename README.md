# Description
`tiny-multi-select` is a [Vue 2.0](https://vuejs.org) plugin that allows you to select multiple values, much like [`vue-multiselect`](https://github.com/shentao/vue-multiselect). Right now it's in development stage. Still needs to update lot many things.


Find the npm package [`link`](https://www.npmjs.com/package/tiny-multi-select)

# Install and basic usage

```sh
$ npm install tiny-multi-select
```

```
<template>
	<div>
	  <multi-select :options="options" v-model="selectedValues" :selected-values="selectedValues" :multiple="true" width="350" track-by="name" label="label" ></multi-select>
  </div>
</template>

<script>
import MultiSelect from 'tiny-multi-select'
export default {
  components: {
    MultiSelect
  },
  data() {
    return {
      options: [
      	{ name: 'AF', label: 'Afghanistan' },
        { name: 'BS', label: 'Bahamas' },
        { name: 'FR', label: 'France' },
        { name: 'IN', label: 'India' },
        { name: 'MC', label: 'Monaco' },
        { name: 'MN', label: 'Mongolia' },
        { name: 'MV', label: 'Maldives' },
        { name: 'PL', label: 'Poland' },
        { name: 'SG', label: 'Singapore' },
        { name: 'GB', label: 'United Kingdom' },
        { name: 'US', label: 'United States' }
      ],
      // set with initial selected values as like this [{ name: 'PL', label: 'Poland' }]
      selectedValues: []
    }
  }
}
</script>
```

## Build Setup or Contributing

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```


