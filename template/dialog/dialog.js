import Template from '../template'

export default {
  /**
	 * 默认参数
	 */
  setDefaults() {
    return {
      title: undefined,
      content: undefined,
      contentCenter: !0,
      buttons: [],
      verticalButtons: !1,
      animation: undefined,
      fieldContent: [],
    }
  },

  /**
	 * dialog组件
	 * @param {Object} opts 配置项
	 * @param {String} opts.title 提示标题
	 * @param {String} opts.content 提示文本
	 * @param {Boolean} opts.contentCenter 提示文本居中
	 * @param {Boolean} opts.verticalButtons 是否显示垂直按钮布局
   * @param {animation} opts.animation box动画
	 * @param {Array} opts.buttons 按钮
	 * @param {String} opts.buttons.text 按钮的文字
	 * @param {String} opts.buttons.type 按钮的类型
	 * @param {Boolean} opts.buttons.bold 是否加粗按钮的文字
	 * @param {String} opts.buttons.formType 按钮提交类型：submit、reset
   * @param {Function} opts.buttons.onTap 按钮的点击事件
   * @param {Array} opts.fieldContent 表单内容
	 * @param {String} opts.fieldContent.type 表单类型：text, number, idcard, digit, password, textarea
	 * @param {String} opts.fieldContent.value 表单的value
	 * @param {String} opts.fieldContent.name 表单的name
	 * @param {String} opts.fieldContent.placeholder 表单提示语
	 */
  init(opts = {}) {
    const options = Object.assign({
      visible: !1,
    }, this.setDefaults(), opts)

    // 实例化组件
    const template = new Template({
      scope: `$xcx.dialog`,
      data: options,
      methods: {
        /**
         * 显示组件
         */
        show() {
          this.setVisible()
        },

        /**
         * 隐藏组件
         */
        hide(callback) {
          this.setHidden([``, `weui-animate-fade-out`], 100)
          typeof callback === `function` && callback()
        },

        /**
				 * 按钮点击事件
				 */
        buttonTapped(e) {
          const index = e.currentTarget.dataset.index
          const button = options.buttons[index]

          if (typeof button.formType === 'undefined')
            this.hide(() => typeof button.onTap === `function` && button.onTap(e))
        },

        /**
         * form表单提交事件用于获取dialog数据
         */
        submitDialogForm(e) {
          const index = e.detail.target.dataset.index
          const button = options.buttons[index]
          typeof button.onTap === `function` && button.onTap(e)
        },

        /**
				 * input获得焦点
				 */
        buttonFoucs(e) {
          const index = e.currentTarget.dataset.index
          const field = options.fieldContent[index]
          this.animationOffset(index + 2)
        },

        /**
				 * input失去焦点
				 */
        buttonBlur(e) {
          const index = e.currentTarget.dataset.index
          const field = options.fieldContent[index]
          this.animationOffset(1)
        },

        /**
				 * dialog上偏移动画
				 */
        animationOffset(index) {
          var animation = wx.createAnimation({
            duration: 0,
            timingFunction: 'ease'
          });
          
          this.animation = animation;
          animation.translateY(-((index * 35) + 15) + '%').step();

          this.setData({
            [`$xcx.dialog.animation`]: animation.export(),
          })
        }
      }
    })

    template.show()

    return template
  }
}