import Template from '../template'

export default {
  /**
	 * 默认参数
	 */
  setDefaults() {
    return {
      className: undefined,
      titleText: undefined,
      checkItems: [],
      checkClicked() { },
      dictName: undefined,
      dictValue: undefined,
      chosenName: [],
      chosenValue: [],
      chosenText: '请选择',
      findOf: undefined,
      onChange(){ }
    }
  },

  /**
	 * 上拉菜单组件
	 * @param {Object} opts 配置项
   * @param {String} id 标识符
	 * @param {String} opts.className 自定义类名
	 * @param {String} opts.titleText 标题
	 * @param {Array} opts.checkItems check列表
   * @param {String} opts.checkItems[dictName] 列表显示name
   * @param {String} opts.checkItems[dictValue] 列表传递value
	 * @param {Array} opts.chosenName 选中的name
	 * @param {Array} opts.chosenValue 选中的value
   * @param {String} opts.chosenText 选中的提示语
   * @param {String} opts.findOf 查找到finOf后清除其他选中项，只保留findOf当前项（达到“不限”选项等功能）
   * @param {Function} opts.onChange 监听值变化的回调函数
	 */
  init(id, opts = {}) {
    const that = this
    const options = Object.assign({
      visible: !1,
      iPhoneX: undefined
    }, this.setDefaults(), opts)

    // 实例化组件
    const template = new Template({
      scope: `$xcx.select.${id}`,
      data: options,
      methods: {
        /**
         * 显示组件
         */
        show() {
          this.setVisible()
          this.setSysinfo()
        },

        /**
         * 隐藏组件
         */
        hide(cb) {
          this.setHidden()
        },

        /**
         * 重置选中
         */
        checkboxReset() {
          this.render([])
        },

        /**
         * 选择change事件
         */
        checkboxChange(e) {
          this.render(e.detail.value)
        },

        /**
				 * 更新组件
				 */
        update(vals = []) {
          if (vals === null)
            vals = ''
          if (typeof vals === 'string')
            vals = vals.split(',')
          const ckItems = options.checkItems
          const names = [options.chosenText]

          if (vals.indexOf(options.findOf) > 0) {
            vals = [options.findOf];
          } else if (vals.indexOf(options.findOf) === 0 && vals.length != 1) {
            vals.splice(0, 1);
          }
          ckItems.forEach((item, index) => {
            ckItems[index].checked = false;
            vals.forEach((val, i) => {
              if (item[options.dictValue] == val) {
                item.checked = true;
                names[i] = item[options.dictName];
                return
              }
            })
          })
          return {
            checkItems: ckItems,
            chosenName: names,
            chosenValue: vals,
          }
        },

        /**
				 * 渲染组件
				 */
        render(value = []) {
          const params = this.update(value)
          this.setData({
            [`$xcx.select.${id}.checkItems`]: params.checkItems,
            [`$xcx.select.${id}.chosenName`]: params.chosenName,
          })
          typeof options.onChange === `function` && options.onChange(params)
        },
      }
    })

    // template.show()
    template.render(options.chosenValue)

    return template
  }
}