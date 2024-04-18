## 父组件
```js
<template>
  <div class="hello">
    <h1 @click="showModal">打开弹窗</h1>
    <Modal v-model="visible"></Modal>
  </div>
</template>
<script setup lang="ts">
  import Modal from './modal-setup.vue'
  defineProps<{ msg: string }>()
  const visible = ref(false)
  const showModal = () => {
    visible.value = true
  }
</script>

<style scoped>
.hello {
  position: relative;
  width: 100px;
}

</style>

```


## 子组件
```js
<template>
  <teleport to="#app">
    <div class="modal" @click="hideModal" v-show="visible">
      modal
    </div>
  </teleport>
</template>
<script setup lang="ts">
  const props = defineProps<{ modelValue: Boolean }>()
  const emit = defineEmits(['update:modelValue'])
  const visible = computed({
    get: () => props.modelValue,
    set: val => {
      emit('update:modelValue', val)
    }
  })

  const hideModal = () => {
    visible.value = false
  }
</script>
<style scoped>
.modal {
  position: absolute;

  top: 0;
  right: 0;
  background: #999;
  width: 300px;
  height: 100vh;
}
</style>


```

