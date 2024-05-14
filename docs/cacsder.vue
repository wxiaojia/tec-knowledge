<template>
  <a-cascader v-model:value="seletedVal" v-bind="hanleAttrs" :placeholder="relPlaceholder" :options="options" @change="handleChange" @dropdownVisibleChange="dropMethods">
    <a-input v-model:value="value" :placeholder="relPlaceholder" @blur="blurCheck" :allowClear="allowInputClear" :disabled="hanleAttrs.disabled" @focus="focus">
      <template #suffix>
        <LoadingOutlined v-if="loading" />
        <DownOutlined v-else style="color: #d9d9d9" />
      </template>
    </a-input>
    <template #[item]="data" v-for="item in Object.keys($slots)">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
    <template #suffixIcon v-if="loading">
      <LoadingOutlined spin />
    </template>
    <template #notFoundContent v-if="loading">
      <span>
        <LoadingOutlined spin class="mr-1" />
        请等待数据加载完成...
      </span>
    </template>
  </a-cascader>
</template>

<script lang="ts">
import { computed, defineComponent, watch, ref, unref } from 'vue'
import { useAttrs, isArray, isFunction, isBoolean, isString } from '@gendo/utils'
import { Cascader as ACascader, Input as AInput } from 'ant-design-vue'

import { get } from 'lodash'
import { LoadingOutlined, DownOutlined } from '@ant-design/icons-vue'
import { useApiCascader } from './hooks/hook'
type Key = string | [string, number]
export default defineComponent({
  name: 'ApiCascader',
  components: { ACascader, AInput, LoadingOutlined, DownOutlined },
  props: {
    api: { type: Function as PropType<(arg?: Recordable) => Promise<Recordable>> },
    params: { type: Object },
    immediate: { type: Boolean, default: true },
    //监听params变化时是否重新加载
    watchParamsLoad: { type: Boolean, default: false },
    resultField: {
      type: String,
      default: ''
    },
    afterFetch: {
      type: Function as PropType<Fn>,
      default: null
    },
    beforeFetch: {
      type: Function as PropType<Fn>,
      default: null
    },
    pageload: {
      type: Boolean,
      default: false
    },
    pageProps: {
      type: Object as PropType<{
        page?: Key
        size?: Key
        total?: string
      }>,
      default: () => ({})
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    searchProp: {
      type: String,
      default: 'search'
    }
  },
  emits: ['options-change', 'change', 'dropdownVisibleChange'],
  setup(props, { attrs, emit }) {
    const options = ref<Recordable[]>([])
    const isFirstLoaded = ref<Boolean>(true)
    const loading = ref(false)
    const pageTotal = ref<number>()
    let timeout: any
    const value = ref(undefined) // 输入框
    const hanleAttrs = useAttrs()
    const seleted = ref([]) // 选中的,对应的选中信息
    const seletedVal = ref(undefined) // 绑定了,对应的key
    const relPlaceholder = ref()
    const lastSearch = ref()
    let timeFindValue = undefined
    const { setInitParam, _param, getProps } = useApiCascader(props, options)

    const fieldNames = computed(() => {
      const fields = unref(hanleAttrs).fieldNames
      return {
        label: fields?.label || 'label',
        value: fields?.value || 'value',
        children: fields?.children || 'children'
      }
    })
    const displayRender = computed(() => {
      const displayRender = unref(hanleAttrs).displayRender
      return displayRender ? displayRender : ({ labels }) => labels.join(' / ')
    })

    function handleChange(...args) {
      console.log('handleChange', args)
      if (!args.length) {
        relPlaceholder.value = props.placeholder
        seletedVal.value = undefined
        seleted.value = undefined
        return
      }
      const render = unref(displayRender)
      value.value = render({
        labels: args[1].map((o) => o[unref(fieldNames).label]),
        selectedOptions: args[1]
      })
      seletedVal.value = args[0]
      seleted.value = args[1]
      relPlaceholder.value = value.value
      emit('change', ...args)
    }

    const allowInputClear = computed(() => {
      const { allowClear } = unref(hanleAttrs)
      if (isBoolean(allowClear)) return allowClear
      return true
    })

    const isSet = ref(false)
    const findValue = async (val) => {
      const { children, value: fieldValue, label } = unref(fieldNames)
      const render = unref(displayRender)
      const first = options.value.find((item) => item[fieldValue] === val[0])
      const seco = first && first[children] && first[children].find((item) => item[fieldValue] === val[1])
      seletedVal.value = val
      isSet.value = true
      if (first?.[label] || seco?.[label]) {
        value.value = render({ labels: [first[label], seco?.[label]], selectedOptions: [first, seco] })
        seleted.value = [first, seco]
      } else if (isFirstLoaded.value) {
        timeFindValue = val
      } else {
        value.value = undefined
      }
    }

    const isClear = ref(false)
    const focus = () => {
      if (!value.value && seletedVal.value) {
        // 清除了
        handleChange()
        isClear.value = true
      } else {
        isClear.value = false
      }
    }

    watch(
      () => props.placeholder,
      (val) => {
        relPlaceholder.value = val
      },
      {
        immediate: true,
        deep: true
      }
    )

    // setFieldsValue, 给的是展示的value(string), 级联是组合的
    watch(
      () => attrs.value,
      (val) => {
        isString(val) && (value.value = val)
        // 根据id找，但么有加载列表的话显示出的是id,翻译不过来
        isArray(val) && findValue(val)
      },
      { deep: true }
    )

    watch(
      () => props.params,
      () => {
        setInitParam()
        ;(!unref(isFirstLoaded) || props.watchParamsLoad) && fetch(true)
      },
      { deep: true }
    )

    watch(
      () => props.immediate,
      async (v) => {
        setInitParam()
        if (v && unref(isFirstLoaded)) {
          await fetch(true)
          if (isFirstLoaded.value) {
            isFirstLoaded.value = false
          }
        }
      },
      {
        immediate: true
      }
    )

    // 是否加载完毕
    const isEnd = computed(() => {
      return options.value.length === pageTotal.value
    })

    const nextPage = () => {
      if (isEnd.value) return
      const [key] = unref(getProps).pageProps.page
      _param.value[key] = _param.value[key] + 1
      fetch()
    }

    // flag的时候清空
    async function fetch(flag?: boolean) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      const _fetch = async () => {
        const { api } = props
        if (!api || !isFunction(api)) return

        const { searchProp } = unref(getProps)
        let params = { ..._param.value, [searchProp]: value.value }
        if (JSON.stringify(params) === JSON.stringify(lastSearch.value)) return
        if (props.afterFetch && isFunction(props.afterFetch)) {
          params = await props.afterFetch(params)
        }
        loading.value = true
        flag && (options.value = [])
        let result
        try {
          result = await api(params)
          lastSearch.value = { ...params }
        } catch (e) {
          console.error(e)
        }

        loading.value = false
        if (!result) return
        if (!isArray(result)) {
          pageTotal.value = get(result, `data.${unref(getProps).pageProps.total}`)
          result = get(result, props.resultField)
        } else {
          pageTotal.value = result.length
        }
        // 数据转化
        if (props.beforeFetch && isFunction(props.beforeFetch)) {
          result = (await props.beforeFetch(result)) || result
        }

        // 数据拼接
        if (flag && !props.pageload) {
          options.value = (result as Recordable[]) || []
        } else {
          options.value = [...options.value, ...((result as Recordable[]) || [])]
        }
        if (timeFindValue) {
          findValue(timeFindValue)
          timeFindValue = undefined
        }
        isFirstLoaded.value = false
        emit('options-change', unref(options))
      }

      timeout = setTimeout(_fetch, 300)
    }

    let menuCon, timeoutId
    const scrollEvent = () => {
      const { scrollTop, scrollHeight, clientHeight } = menuCon
      if (scrollTop + clientHeight === scrollHeight) {
        nextPage()
      }
    }

    const dropMethods = async (val) => {
      if (!props.immediate && unref(isFirstLoaded)) {
        setInitParam()
        await fetch(true)
      }
      if (!props.pageload) return
      if (val) {
        // 选中就清空
        value.value = ''

        timeoutId = setTimeout(() => {
          menuCon = document.querySelectorAll('.ant-cascader-menu')?.[0]
          menuCon.addEventListener('scroll', scrollEvent)
        }, 0)
      } else {
        menuCon = null
        timeoutId = null
      }
      emit('dropdownVisibleChange', val)
    }

    // 输入的时候清空，并发送请求
    watch(
      () => value.value,
      async (val, oldVal) => {
        if (val !== oldVal) isSet.value = false
        check(() => {
          const { onSearch } = unref(hanleAttrs)
          setInitParam()
          fetch(true)
          onSearch && isFunction(onSearch) && onSearch(val)
        })
      }
    )
    const check = (callback?: any) => {
      const render = unref(displayRender)
      const oldV = render({
        labels: seleted.value?.map((o) => o[unref(fieldNames).label]),
        selectedOptions: seleted.value
      })
      if (unref(value) !== oldV) {
        callback()
      }
    }

    // 校验是否对应，不对应则清空 ==> 不能搜索功能
    const blurCheck = () => {
      if (isArray(seletedVal.value) && !isClear.value && relPlaceholder.value !== props.placeholder) {
        value.value = relPlaceholder.value
        return
      }
      // 是否为设置的，设置的不清空
      if (unref(isSet)) {
        isSet.value = false
        return
      }
      check(() => {
        value.value = ''
        seletedVal.value = []
        seleted.value = []
        setInitParam()
        fetch(true)
        emit('change', '')
      })
    }

    return { hanleAttrs, loading, handleChange, focus, dropMethods, options, value, relPlaceholder, allowInputClear, seletedVal, blurCheck }
  }
})
</script>
