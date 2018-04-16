import Template from '../template'

export default {
  /**
	 * 默认参数
	 */
  setDefaults() {
    return {
      className: undefined,
      titleText: undefined,
      buttons: [],
      buttonClicked() { },
      cancelText: `取消`,
      cancel() { },
      delText: ``,
      delClick() { },
    }
  },

  /**
	 * 上拉菜单组件
	 * @param {Object} opts 配置项
	 * @param {String} opts.className 自定义类名
	 * @param {String} opts.titleText 标题
	 * @param {Array} opts.buttons 按钮
   * @param {String} opts.buttons.classNmae 按钮的类名
   * @param {String} opts.buttons.text 按钮的文字
	 * @param {Function} opts.buttonClicked 按钮点击事件
	 * @param {String} opts.cancelText 取消按钮的文本
	 * @param {Function} opts.cancel() 取消按钮点击事件
	 * @param {String} opts.delText 删除按钮的文本
	 * @param {Function} opts.delClick() 删除按钮点击事件
	 */
  init(opts = {}) {
    const options = Object.assign({
      visible: !1,
      iPhoneX: undefined
    }, this.setDefaults(), opts)

    // 实例化组件
    const template = new Template({
      scope: `$xcx.actionsheet`,
      data: options,
      methods: {
        /**
         * 显示组件
         */
        showSheet() {
          this.setVisible()
          this.setSysinfo()
        },

        /**
         * 隐藏组件
         */
        hideSheet(callback) {
          this.setHidden()
          typeof callback === `function` && callback(options.buttons)
        },

        /**
         * 菜单按钮点击事件
         */
        buttonClicked(e) {
          const index = e.currentTarget.dataset.index

          options.buttonClicked(index, options.buttons[index])
          this.hideSheet()
        },

        /**
         * 取消事件
         */
        cancel() {
          this.hideSheet(options.cancel)
        },

        /**
         * 删除按钮点击事件
         */
        delClick() {
          options.delClick()
          this.hideSheet()
        },
      }
    })

    template.showSheet()

    return template
  }
}