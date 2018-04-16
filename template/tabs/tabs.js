import Template from '../template'

export default {
  /**
	 * 默认参数
	 */
  setDefaults() {
    return {
      tabs: [
        {
          id: 0,
          icon: '',
          title: '菜单1'
        },
        {
          id: 1,
          icon: '',
          title: '菜单2'
        },
        {
          id: 2,
          icon: '',
          title: '菜单3'
        }
      ],
      className: '',
      selectedId: 0,
      scroll: false,
      height: 88,
      fixed: false,
      left: 0,
      handleTabChange(e) { }
    }
  },

  /**
	 * tabs组件
   * @param {Object} opts 配置项
	 * @param {String} id 唯一标识
	 * @param {Object} options.tabs tab列表数据
   * @param {String、Number} options.tabs.id tab标示符
   * @param {String} options.tabs.icon tab图标
   * @param {String} options.tabs.title tab标题
   * @param {String} options.className 自定义类名
	 * @param {String、Number} options.selectedId 选中位置
	 * @param {Boolean} options.scroll 是否可滑动
	 * @param {Number} options.height tab高度
	 * @param {Boolean} options.fixed windows绝对定位
   * @param {Number} options.left 设置左侧偏移
	 * @param {Function} options.handleTabChange() 切换tab是的回调函数
	 */
  
  init(id, opts = { }) {
    const options = Object.assign({}, this.setDefaults(), opts)

    // 实例化组件
    const template = new Template({
      scope: `$xcx.tabs.${id}`,
      data: options,
      methods: {
        /**
         * 初始化组件
         */
        init() {
          this.setVisible()
        },

        /**
         * 切换点击事件
         */
        handleTabChange(e) {
          let item = e.currentTarget.dataset
          let selectedId = item.itemId;

          // 更新选中位置
          this.update(selectedId, item);
        },

        /**
         * 更新选中位置
         */
        update(selectedId = 0, item = {}) {
          typeof item.itemId === `undefined` ? item = { itemId: selectedId } : item

          this.setData({
            [`$xcx.tabs.${id}.selectedId`]: selectedId,
            [`$xcx.tabs.${id}.left`]: (selectedId - 2) * 96,
          })

          options.handleTabChange(item)
        }
      },
    })

    template.init()

    return template
  }
}