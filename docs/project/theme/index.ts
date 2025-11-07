import { nextTick, provide, inject, Ref, ref, watchEffect, getCurrentInstance } from 'vue'
import { defaultVars } from './vars'

const ProjectVarsKey = Symbol('ProjectVarsKey')
// 存
let projectVarsRef = null
let syncWatcher: (() => void) | null = null // 用于存储 watchEffect 的停止函数

// 供项目注入变量的函数
export function provideProjectVars(vars: Partial<typeof defaultVars>) {
  // 验证是否在setup中调用
  const projectInstance = getCurrentInstance()
  if (!projectInstance) {
    throw new Error('provideProjectVars 必须在组件的 setup 函数中调用')
  }
  projectVarsRef = ref({ ...defaultVars, ...vars }) as Ref<typeof defaultVars>

  provide(ProjectVarsKey, projectVarsRef)
  return projectVarsRef
}

// 供组件获取变量的函数
export function useProjectVars() {
  const vars = inject(ProjectVarsKey)
  if (!vars) {
    console.log(`[组件库] 成功获取变量: ${new Date().toISOString()}`)
    return ref(defaultVars)
  } else {
    console.log('成功获取项目注入的变量：', vars.value)
    return vars
  }
}

/**
 * 转为中划线命名
 */
export const convertToLine = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

// 同步 JS 变量到 CSS 全局变量
export function syncThemeToCSS() {
  if (!projectVarsRef) {
    // console.warn('未获取到项目注入的变量，使用默认值')
    projectVarsRef = ref(defaultVars)
  }

  // 如果之前有监听器，先停止它
  if (syncWatcher) {
    syncWatcher()
  }

  // 监听变量变化，实时同步到 CSS
  syncWatcher = watchEffect(() => {
    const root = document.documentElement

    // 映射为 CSS 变量（带前缀避免冲突）
    for (const key in projectVarsRef.value) {
      root.style.setProperty(`--g-${convertToLine(key)}`, projectVarsRef.value[key])
    }
  })
  return syncWatcher
}

// 主题插件（供根组件库注册）
export const ThemePlugin = {
  install(app) {
    // 自动同步主题变量到 CSS,执行一次，项目不调用也可以使用默认的变量
    syncThemeToCSS()
    app.config.globalProperties.$syncTheme = async () => {
      syncThemeToCSS()
      await nextTick()
    }
  }
}
