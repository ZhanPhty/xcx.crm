// pages/pageClue/changeClue.js
const app = getApp();
const globalData = app.globalData;
import WxValidate from '../../utils/WxValidate';
import { $select } from '../../template/xcx'

Page({
  data: {
    detailId: '',
    contactSex: [
      {
        name: '请选择'
      },
      {
        value: 'M',
        name: '男'
      },
      {
        value: 'W',
        name: '女'
      }
    ],
    contactSexIndex: 0,
    clientSource: [],
    clientSourceIndex: 0,
    companyType: [],
    companyTypeIndex: 0,
    companySize: [],
    companySizeIndex: 0,
    mainBusiness: []
  },
  onLoad(options) {
    this.setData({
      detailId: options.id
    });

    this.initValidate();
    this.getChangeClueView();
  },
  submitForm(e) {
    let params = e.detail.value;
    wx.showNavigationBarLoading();
    
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/clue/validityFirmIdAndFullName',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token,
        clueId: this.data.detailId,
        firmId: params.firmId,
        companyName: params.companyName
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        wx.hideNavigationBarLoading();
        if (res.statusCode === 200 && res.data.isSuccess === 'true') {
          // 传入表单数据，调用验证方法
          if (!this.WxValidate.checkForm(e)) {
            const error = this.WxValidate.errorList[0]
            app.showTopTips(this, error.msg);
            return false
          } else {
            this.addChangeClueForm(params);
          }
        } else {
          app.showTopTips(this, res.data.msg);
        }
      }
    });
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      firmId: {
        required: true
      },
      companyName: {
        required: true
      },
      clientSource: {
        required: true
      },
      contactName: {
        required: true
      }
    }

    // 验证字段的提示信息
    const messages = {
      firmId: {
        required: '请输入摊位号'
      },
      companyName: {
        required: '请输入公司名称'
      },
      clientSource: {
        required: '请选择客户来源'
      },
      contactName: {
        required: '请输入联系人姓名'
      }
    }

    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  /**
   * 获取页面数据
   */
  getChangeClueView(e) {
    let _this = this;
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/clue/changeClueView',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token,
        clueId: _this.data.detailId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        if (res.statusCode === 200 && res.data.isSuccess === 'true') {
          let data = res.data.clueVo;
          res.data.CLIENTSOURCE.unshift({ "dictName": "请选择" });
          res.data.COMPANYTYPE.unshift({ "dictName": "请选择" });
          res.data.COMPANYSIZE.unshift({ "dictName": "请选择" });

          _this.setData({
            userId: data.userId,
            userName: data.userName,
            companyName: data.person,
            contactName: data.person,
            contactPhone: data.mobile,
            contactPosition: data.position,
            contactWork: data.mainWork,
            clientSource: res.data.CLIENTSOURCE,
            companyType: res.data.COMPANYTYPE,
            companySize: res.data.COMPANYSIZE,
            mainBusiness: res.data.MAINBUSINESS,
            tradeName: '请选择'
          });

          setTimeout(() => {
            for (let i = 0; i < _this.data.clientSource.length; i++) {
              if (_this.data.clientSource[i].dictValue === data.clueSource) {
                _this.setData({
                  clientSourceIndex: i
                })
              }
            }

            /**
             * 修改模式 - 初始化主营产品
             */
            _this.selectTel(_this.data.mainBusiness, data.tradeType);
          }, 100)
        }
      }
    });
  },
  /**
   * 转化为客户
   */
  addChangeClueForm(e) {
    let _this = this;
    wx.showNavigationBarLoading();
    e['uias_session'] = globalData.uias_session;
    e['token'] = globalData.token;
    e['clueId'] = _this.data.detailId;
    
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/clue/changeClue',
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
          let currPage = getCurrentPages();
          wx.navigateBack({
            delta: 2,
            success: res => {
              currPage[0].data.currPage = {
                tabNo: 2,
                pageInfo: 'team'
              };
            }
          });
        } else {
          app.showTopTips(_this, res.data.msg);
        }
      }
    })
  },
  /**
   * 客户来源
   */
  bindClientSource(e) {
    this.setData({
      clientSourceIndex: e.detail.value
    })
  },
  /**
   * 公司类型
   */
  bindCompanyType(e) {
    this.setData({
      companyTypeIndex: e.detail.value
    })
  },
  /**
   * 公司规模
   */
  bindCompanySize(e) {
    this.setData({
      companySizeIndex: e.detail.value
    })
  },
  /**
   * 性别
   */
  bindContactSex(e) {
    this.setData({
      contactSexIndex: e.detail.value
    })
  },
  /**
   * 主营行业切换
   */
  toggleMainPopup(e) {
    this.select.show()
  },
  /**
   * 初始化select组件
   */
  selectTel(items, vals) {
    this.select = $select.init('main', {
      checkItems: items,
      dictName: 'dictName',
      dictValue: 'dictValue',
      chosenValue: vals,
      onChange: (e) => {
        this.setData({
          tradeName: e.chosenName,
          tradeType: e.chosenValue
        })
      }
    })
  },
})