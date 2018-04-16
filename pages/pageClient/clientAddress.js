// pages/pageClient/clientAddress.js
const app = getApp();
const globalData = app.globalData;
import WxValidate from '../../utils/WxValidate';

Page({
  data: {
    detailId: '',
    addressId: '',
    oprType: '',
    addressType: [],
    addressTypeIndex: 0,
    regionActive: [],
    address: '',
    postCode: '',
    person: '',
    mobile: '',
    notes: '',
    isUpdate: false
  },
  onLoad: function (options) {
    this.setData({
      detailId: options.id,
      addressId: options.addId,
      oprType: options.oprType
    });
    //初始化表单验证
    this.initValidate();
    this.getAddressView();
    this.getUpdateAddressView(options); //编辑模式
  },
  submitForm(e) {
    let params = e.detail.value;

    // 传入表单数据，调用验证方法
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0]
      app.showTopTips(this, error.msg);
      return false
    } else {
      if (this.data.isUpdate) {
        this.addAddressForm(params, 'update');
      } else {
        this.addAddressForm(params);
      }
    }
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      addressType: {
        required: true
      },
      province: {
        required: true
      },
      city: {
        required: true
      },
      county: {
        required: true
      },
      address: {
        required: true
      }
    }

    // 验证字段的提示信息
    const messages = {
      addressType: {
        required: '请选择地址类型'
      },
      province: {
        required: '请选择省/市/区'
      },
      city: {
        required: '请选择市/区'
      },
      county: {
        required: '请选择区/县'
      },
      address: {
        required: '请输入详细地址'
      }
    }

    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  /**
   * 获取页面数据
   */
  getAddressView(e) {
    let _this = this;
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/clientAddress/addClientAddressView',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        if (res.statusCode === 200) {
          res.data.ADDRESSTYPE.unshift({ "dictName": "请选择" });

          _this.setData({
            addressType: res.data.ADDRESSTYPE
          });
        }
      }
    })
  },
  /**
   * 编辑模式 - 编辑地址
   */
  getUpdateAddressView(e) {
    let _this = this;
    if (e.pageType === 'update') {
      wx.setNavigationBarTitle({
        title: '修改地址'
      });

      wx.request({
        url: globalData.crmApiUrl + '/api/wxxcx/crm/clientAddress/updateClientAddressView',
        data: {
          uias_session: globalData.uias_session,
          token: globalData.token,
          addressId: _this.data.addressId
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        complete: res => {
          if (res.statusCode === 200) {
            let data = res.data.clientAddressVo;
            _this.setData({
              regionActive: [data.province, data.city, data.county],
              address: data.address,
              postCode: data.postCode,
              person: data.person,
              mobile: data.mobile,
              notes: data.notes,
              isUpdate: true
            });

            setTimeout(() => {
              for (var i = 0; i < _this.data.addressType.length; i++) {
                if (_this.data.addressType[i].dictValue === data.addressType) {
                  _this.setData({
                    addressTypeIndex: i
                  })
                }
              }
            }, 100)
          }
        }
      });
    }
  },
  /**
   * 提交数据
   */
  addAddressForm(e, pageType) {
    let _this = this;
    let url = '';
    wx.showNavigationBarLoading();
    e['uias_session'] = globalData.uias_session;
    e['token'] = globalData.token;
    e['clientId'] = _this.data.detailId;

    if (pageType === 'update') {
      /**
       * 修改地址接口
       */
      e['addressId'] = _this.data.addressId;
      url = '/api/wxxcx/crm/clientAddress/updateClientAddress';
    } else {
      e['isDefault'] = 'N';
      url = '/api/wxxcx/crm/clientAddress/addClientAddress';
    }
    
    wx.request({
      url: globalData.crmApiUrl + url,
      data: e,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        setTimeout(function () {
          wx.hideNavigationBarLoading()
        }, 500);
        if (res.statusCode === 200 && res.data.isSuccess === 'true') {
          /**
           * 通过getCurrentPages() 通知首页更改状态
           * tabNO -> 切换tabs位置； pageInfo: 执行的事件标识（查看父级onShow生命周期）
           */
          let currPage = getCurrentPages();
          wx.navigateBack({
            success: res => {
              currPage[currPage.length - 2].data.currPage = {
                tabNo: 2,
                pageInfo: 'address'
              };
            }
          });
        } else {
          app.showTopTips(_this, res.data.msg);
        }
      }
    })
  },
  bindAddressType(e) {
    this.setData({
      addressTypeIndex: e.detail.value
    })
  },
  bindCityRegion: function (e) {
    /**
     * 替换'请选择'为空
     */
    if (e.detail.value[0] === '请选择' || e.detail.value[1] === '请选择' || e.detail.value[2] === '请选择') {
      for (var i = 0; i < e.detail.value.length; i++) {
        if (e.detail.value[i] === '请选择') {
          e.detail.value[i] = '';
        }
      }
    }

    console.log(e)
    this.setData({
      regionActive: e.detail.value
    })
  }
})