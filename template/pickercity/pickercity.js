import Template from '../template'
import data from './citydata'

const format = (data) => {
  let result = []
  for (let key in data) {
    let formatJson = {}
    formatJson.code = key
    formatJson.name = data[key]
    result.push(formatJson)
  }
  if (result.length) return result
  return [{ code: '', name: '' }]
};

const getDistricts = (defCode = defaultCode) => {
  if (typeof defCode === 'object') defCode = defCode.code
  for (let key in raw) {
    if (key === String(defCode)) {
      return format(raw[key])
    }
  }
  return format([])
}

let raw = data
let defaultCode = 100000;
let provinces = getDistricts(defaultCode)
let currentProvince = provinces[0]
let initCities = getDistricts(currentProvince)
let currentCity = initCities[0]
let initDistricts = getDistricts(currentCity)
let currentDistrict = initDistricts[0]

export default {
  /**
	 * 默认参数
	 */
  setDefaults() {
    return {
      customItem: '请选择',
      cols: [
        provinces,
        initCities,
        initDistricts
      ],
      rangeKey: 'name',
      region: [],
      value: [],
      onChange() { }
    }
  },
  /**
	 * 缓存上一次滑动的value
	 */
  tempValue: [],
  /**
	 * 渲染选择器组件
	 * @param {String} id   唯一标识
	 * @param {Object} opts 配置项
	 * @param {Array} opts.cols 选择器的数据
	 * @param {Array} opts.cols.provinces 自定义第一列省份
	 * @param {Array} opts.cols.initCities 自定义第二列市区
	 * @param {Array} opts.cols.initDistricts 自定义第二列县
	 * @param {String} opts.rangeKey 循环的key
	 * @param {Array} opts.value 选择器的默认Value
   * @param {Array} opts.region 选择器的默认值
	 * @param {Function} opts.onChange 监听值变化的回调函数
	 */
  init(id, opts = {}) {
    const that = this
    const options = Object.assign({}, this.setDefaults(), opts)
    const tempValue = that.tempValue[id] = that.tempValue[id] ? that.tempValue[id] : [0, 0, 0]
    const updateValue = (cols = [], arr = []) => {
      let newProvince = cols[0]
      let newCity = []
      let newDistricts = []
      let newValue = []

      /**
       * 判断arr类型
       * return {Array} value 返回遍历对应的index
       */
      if (arr.length > 0 && typeof arr[0] !== 'undefined') {
        newValue = arr
        if (typeof arr[0] === 'string') {
          newValue = []
          for (let i = 0; i < newProvince.length; i++) {
            if (newProvince[i].name === arr[0]) {
              const city = getDistricts(newProvince[i])
              newValue.push(i)
              for (let j = 0; j < city.length; j++) {
                if (city[j].name === arr[1]) {
                  newValue.push(j)
                  const district = getDistricts(city[j])
                  for (let k = 0; k < district.length; k++) {
                    if (district[k].name === arr[2]) {
                      newValue.push(k)
                    }
                  }
                }
              }
            }
          }
        }

        // 刷新city列表
        newCity = getDistricts(newProvince[newValue[0]])
        newDistricts = getDistricts(newCity[newValue[1]])
        cols[0] = newProvince
        cols[1] = newCity
        cols[2] = newDistricts
      }
      
      return {
        cols: cols,
        value: newValue
      }
    }
    
    // 实例化组件
    const template = new Template({
      scope: `$xcx.pickercity.${id}`,
      data: options,
      methods: {
        /**
				 * 点击picjer'确定'时传值
				 */
        bindchange(e) {
          this.render(e.detail.value)
        },

        /**
				 * 当滚动选择，某一列的值改变时触发 columnchange 事件
				 */
        bindMultiColumnChange(e) {
          const newValue = e.detail
          switch (newValue.column) {
            case 0:
              tempValue[0] = newValue.value
              tempValue[1] = 0
              tempValue[2] = 0
              break
            case 1:
              tempValue[1] = newValue.value
              tempValue[2] = 0
              break
            case 2:
              tempValue[2] = newValue.value
              break
          }

          this.render(tempValue)
        },
        
				/**
				 * 更新组件
				 */
        update: updateValue,

				/**
				 * 渲染组件
				 */
        render(value = []) {
          const cols = this.getComponentData().cols
          const params = this.update(cols, value)
          this.setData({
            [`$xcx.pickercity.${id}.cols`]: params.cols,
            [`$xcx.pickercity.${id}.value`]: params.value,
          })
          typeof options.onChange === 'function' && options.onChange(params)
        },
      }
    })

    template.render(options.region)
  },
}