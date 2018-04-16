// pages/addClient/addClient.js
const app = getApp();
const globalData = app.globalData;
import WxValidate from '../../utils/WxValidate';
import { $select, $pickercity } from '../../template/xcx'

Page({
  data: {
    detailId: '',
    showMainPopup: false,
    isUpdate: false
  },
  onLoad: function (options) {
    this.setData({
      detailId: options.id
    });

    this.pickercity = $pickercity.init('city', {
      region: ['山西省', '大同市', '新荣区'],
      onChange(e) {
        console.log(e.cols[0][e.value[0]].code)
        console.log(e.cols[1][e.value[1]].name)
        console.log(e.cols[2][e.value[2]])
      }
    })
  }
})