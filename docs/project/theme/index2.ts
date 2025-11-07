/**
 * 获取主题变量
  优点：
  与 modifyVars 完美兼容。
  不依赖 Vue 的 provide/inject，更通用。
  支持运行时动态切换主题（只需修改 :root 的 CSS 变量）。
  性能好，getComputedStyle 开销小。
  缺点：
  项目方必须将 modifyVars 的变量映射为 CSS 变量。
  需要用到的时候，组件库内的组件要去执行useThemeVars()。
 */
import { ref, onUnmounted } from 'vue'

export function getThemeVarsFromCSS() {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root)

  return {
    primaryColor: computedStyle.getPropertyValue('--g-primary-color').trim() || '#1890ff',
    textColor: computedStyle.getPropertyValue('--g-text-color').trim() || '#333',
    // ... 其他变量，提供默认值
  };
}

// 组件库内部组件使用
export function useThemeVars() {
  const root = document.documentElement

  const vars = ref(getThemeVarsFromCSS())

  // 可以监听 CSS 变量变化（可选）
  const observer = new MutationObserver(() => {
    Object.assign(vars.value, getThemeVarsFromCSS());
  })

  observer.observe(root, {
    attributes: true,
    attributeFilter: ['style']
  })

  onUnmounted(() => {
    observer.disconnect()
  })

  return vars
}
