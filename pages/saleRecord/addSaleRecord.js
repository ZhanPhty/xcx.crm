// pages/saleRecord/addSaleRecord.js
const app = getApp()
const globalData = app.globalData;
import WxValidate from '../../utils/WxValidate';

Page({
  data: {
    detailId: '',
    oprType: '',
    showFixed: true,
    showConfirmBar: false,
    saleRecordType: [],
    recordTypeIndex: 0
  },
  onLoad: function (options) {
    let _this = this;

    //初始化表单验证
    this.initValidate();

    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          winHeigth: res.windowHeight - (46 + 46 + 30)
        });
      }
    });
    // 将详情id放入页面，方便使用
    // oprType --> A: 销售记录； B: 联系人; C: 客户；
    this.setData({
      detailId: options.id,
      oprType: options.oprType
    })

    // 获取销售记录类型
    this.getSaleRecordType();
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      saleRecordContent: {
        required: true
      },
      saleRecordType: {
        required: true
      }
    }

    // 验证字段的提示信息
    const messages = {
      saleRecordContent: {
        required: '请输入销售记录'
      },
      saleRecordType: {
        required: '请选择销售记录类型'
      }
    }

    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  submitForm(e) {
    let params = e.detail.value;
    // 传入表单数据，调用验证方法
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0]
      app.showTopTips(this, error.msg);
      return false
    } else {
      this.addSaleRecord(params);
    }
  },
  addSaleRecord(e) {
    let _this = this;
    wx.showNavigationBarLoading();
    e['uias_session'] = globalData.uias_session;
    e['token'] = globalData.token;

    _this.setData({
      btnType: true
    })

    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/saleRecord/addSaleRecord',
      data: e,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        _this.setData({
          btnType: false
        })
        if (res.data.isSuccess == 'true') {
          wx.hideNavigationBarLoading();
          /**
           * 通过getCurrentPages() 通知首页更改状态
           * tabNO -> 切换tabs位置； pageInfo: 执行的事件标识（查看父级onShow生命周期）
           */
          let currPage = getCurrentPages();
          wx.navigateBack({
            success: res => {
              currPage[currPage.length - 2].data.currPage = {
                tabNo: 1,
                pageInfo: 'success'
              };
            }
          });
        } else {
          app.showTopTips(_this, res.data.msg);
        }
      }
    });
  },
  /**
   * 销售记录类型
   */
  getSaleRecordType() {
    let _this = this;

    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/saleRecord/getSaleRecordTypeDict',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        let data = res.data;
        if (res.data.isSuccess == 'true') {
          data.SALERECORDTYPE.unshift({ "dictName": "选择销售记录类型" });
          _this.setData({
            saleRecordType: data.SALERECORDTYPE
          });
        } else {
          app.showTopTips(_this, res.data.msg);
        }
      }
    })
  },
  bindRecordType(e) {
    this.setData({
      recordTypeIndex: e.detail.value
    });
  }
})