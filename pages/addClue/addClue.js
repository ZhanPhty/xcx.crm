// pages/addClue/addClue.js
const app = getApp();
const globalData = app.globalData;
import WxValidate from '../../utils/WxValidate';
import { $select } from '../../template/xcx'

Page({
  data: {
    detailId: '',
    token: globalData.token,
    showMainPopup: false,
    clueSource: [],
    cluelevel: [],
    mainbusiness: [],
    poolList: [],
    clueSourceIndex: 0,
    clueLevelIndex: 0,
    poolListIndex: 0,
    isUpdate: false
  },
  onLoad(options) {
    //初始化表单验证
    this.initValidate();
    this.getAddClueView();
    this.parseCardData(options); //名片
    this.getUpdateClueView(options); //编辑模式
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
        this.updateClueForm(params);
      } else {
        this.addClueForm(params);
      }
    }
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      person: {
        required: true
      },
      mobile: {
        required: true
      },
      clueSource: {
        required: true
      }
    }

    // 验证字段的提示信息
    const messages = {
      person: {
        required: '请输入姓名'
      },
      mobile: {
        required: '请输入手机号'
      },
      clueSource: {
        required: '请选择线索来源'
      }
    }

    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  /**
   * 获取页面数据
   */
  getAddClueView(e) {
    let _this = this;
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/clue/addClueView',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        if (res.statusCode === 200) {
          res.data.CLUESOURCE.unshift({ "dictName": "请选择" });
          res.data.CLUELEVEL.unshift({ "dictName": "请选择" });
          res.data.poolList.unshift({ "poolName": "请选择" });

          _this.setData({
            clueSource: res.data.CLUESOURCE,
            cluelevel: res.data.CLUELEVEL,
            poolList: res.data.poolList,
            tradeName: '请选择'
          });
          // 初始化select自定义组件
          _this.selectTel(res.data.MAINBUSINESS);
        }
      }
    })
  },
  /**
   * 提交数据
   */
  addClueForm(e) {
    let _this = this;

    wx.showNavigationBarLoading();
    e['uias_session'] = globalData.uias_session;

    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/clue/addClue',
      data: e,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        setTimeout(function () {
          wx.hideNavigationBarLoading()
        }, 500);

        if (res.data.isSuccess == 'true') {
          wx.showModal({
            title: res.data.msg,
            content: '是否继续新增线索?',
            cancelText: '返回首页',
            confirmText: '继续新增',
            success: function (res) {
              if (res.confirm) {
                _this.setData({
                  clueSourceIndex: 0,
                  clueLevelIndex: 0,
                  poolListIndex: 0,
                  person: '',
                  mobile: '',
                  phoneNo: '',
                  company: '',
                  position: '',
                  fax: '',
                  qq: '',
                  email: '',
                  url: '',
                  address: '',
                  mainWork: '',
                  tradeType: '',
                  tradeName: '请选择',
                  clueDesc: '',
                  clueNameCard: ''
                });

                // 重置主营行业
                _this.select.render([])
              } else if (res.cancel) {
                // 返回首页时，通知首页重新刷新列表数据
                let currPage = getCurrentPages();
                wx.navigateBack({
                  success: res => {
                    currPage[currPage.length - 2].data.currPage = {
                      pageInfo: 'success'
                    };
                  }
                });
              }
            }
          })
        } else {
          app.showTopTips(_this, res.data.msg);
        }
      }
    })
  },
  /**
   * 线索来源
   */
  bindClueSource(e) {
    this.setData({
      clueSourceIndex: e.detail.value
    })
  },
  /**
   * 线索级别
   */
  bindClueLevel(e) {
    this.setData({
      clueLevelIndex: e.detail.value
    })
  },
  /**
   * 线索级别
   */
  bindPoolList(e) {
    this.setData({
      poolListIndex: e.detail.value
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
  /**
   * 修改销售线索
   */
  getUpdateClueView(e) {
    let _this = this;
    if (e.pageType === 'update') {
      wx.setNavigationBarTitle({
        title: '修改线索'
      });

      wx.request({
        url: globalData.crmApiUrl + '/api/wxxcx/crm/clue/updateClueView',
        data: {
          uias_session: globalData.uias_session,
          token: globalData.token,
          clueId: e.clueId
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        complete: res => {
          if (res.statusCode === 200) {
            let data = res.data.clueVo;
            _this.setData({
              person: data.person,
              mobile: data.mobile,
              phoneNo: data.phoneNo,
              company: data.company,
              position: data.position,
              fax: data.fax,
              qq: data.qq,
              email: data.email,
              url: data.url,
              address: data.address,
              mainWork: data.mainWork,
              clueDesc: data.clueDesc,
              isUpdate: true,
              detailId: e.clueId
            });

            setTimeout(() => {
              for (let i = 0; i < _this.data.clueSource.length; i++) {
                if (_this.data.clueSource[i].dictValue === data.clueSource) {
                  _this.setData({
                    clueSourceIndex: i
                  })
                }
              }
              for (let i = 0; i < _this.data.cluelevel.length; i++) {
                if (_this.data.cluelevel[i].dictValue === data.clueLevel) {
                  _this.setData({
                    clueLevelIndex: i
                  })
                }
              }
              for (let i = 0; i < _this.data.poolList.length; i++) {
                if (_this.data.poolList[i].poolId === data.poolId) {
                  _this.setData({
                    poolListIndex: i
                  })
                }
              }

              /**
               * 修改模式 - 初始化主营产品
               */
              _this.select.render(data.tradeType)
             
            }, 100)
          }
        }
      });
    }
  },
  /**
   * 更新线索详情
   */
  updateClueForm(e) {
    let _this = this;
    
    e['uias_session'] = globalData.uias_session;
    e['clueId'] = _this.data.detailId;
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/clue/updateClue',
      data: e,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        setTimeout(function () {
          wx.hideNavigationBarLoading()
        }, 500);

        if (res.data.isSuccess === 'true') {
          /**
           * 通过getCurrentPages() 通知首页更改状态
           * tabNO -> 切换tabs位置； pageInfo: 执行的事件标识（查看父级onShow生命周期）
           */
          let currPage = getCurrentPages();
          wx.navigateBack({
            success: res => {
              currPage[currPage.length - 2].data.currPage = {
                tabNo: '0',
                pageInfo: 'update'
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
   * 名片传入数据
   */
  parseCardData(e) {
    let _this = this;

    if (e.pageType === 'card') {
      wx.showLoading({
        title: '名片解析中',
        mask: true
      });

      wx.uploadFile({
        url: globalData.crmApiUrl + '/api/wxxcx/crm/base/parseCard',
        filePath: e.parseCartUrl,
        name: 'file',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        formData: {
          uias_session: globalData.uias_session,
          token: globalData.token
        },
        success: function (res) {
          wx.hideLoading()
          let cardJson = JSON.parse(res.data);

          if (cardJson.isSuccess === 'true') {
            _this.setData({
              person: cardJson.data.person,
              mobile: cardJson.data.mobile,
              phoneNo: cardJson.data.phoneNo,
              company: cardJson.data.company,
              position: cardJson.data.position,
              fax: cardJson.data.fax,
              qq: cardJson.data.qq,
              email: cardJson.data.email,
              url: cardJson.data.url,
              address: cardJson.data.address,
              mainWork: cardJson.data.mainWork,
              clueDesc: '',
              clueNameCard: e.parseCartUrl,
              clueSourceIndex: 1,
              clueLevelIndex: 1
            });
          } else {
            app.showTopTips(_this, cardJson.msg);
          }
        },
        fail: function () {
          app.showTopTips(_this, '请求服务器失败');
        }
      });
    }
  }
})