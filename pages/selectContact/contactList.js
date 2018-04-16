// pages/saleRecord/addSaleRecord.js
const app = getApp()
const globalData = app.globalData;
const colorList = app.globalVariable.colorList;

Page({
  data: {
    detailId: '',
    oprType: '',
    operation: '',
    contactCount: 0,
    winHeight: 420,
    sidePrompt: false,
    sidePromptTop: 4,
    contactArr: {},
    firstRefresh: true,
    sliderRight: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z']
  },
  onLoad: function (options) {
    let _this = this;

    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          winHeight: res.windowHeight - (46)
        });
      }
    });

    /**
     * 将详情id放入页面，方便使用
     * oprType --> A: 销售记录； B: 联系人; C: 客户；
     * operation --> follow: 添加跟进人； charge: 更换负责人
     */
    _this.setData({
      detailId: options.id,
      oprType: options.oprType,
      operation: options.operation
    })

    _this.getAllMembers();
  },
  /**
   * 提交数据
   */
  submitForm(e) {
    let _this = this;
    let params = e.detail.value;
    let paramArray = [];
    let dataJson = {};

    for (var key in params) {
      for (var i = 0; i < params[key].length; i++) {
        paramArray.push(params[key][i]);
      }
    }

    /**
     * 拼接数据
     */
    dataJson['uias_session'] = globalData.uias_session;
    dataJson['token'] = globalData.token;
    dataJson['userIds'] = paramArray.toString();
    dataJson['userId'] = paramArray.toString();
    dataJson['oprType'] = _this.data.oprType;
    switch (_this.data.oprType) {
      case 'A':
        dataJson['clueIds'] = _this.data.detailId;
        break;
      case 'B':
        dataJson['contactIds'] = _this.data.detailId;
        break;
      case 'C':
        dataJson['clientIds'] = _this.data.detailId;
        break;
    }
 
    /**
     * operation --> follow: 添加跟进人； charge: 更换负责人
     */
    if (paramArray.length > 0) {
      switch (_this.data.operation) {
        case 'follow':
          _this.addFollowList(dataJson);
          break;
        case 'charge':
          if (paramArray.length < 2) {
            _this.replaceCharge(dataJson);
          } else {
            app.showTopTips(_this, '只能选择一项');
          }
          break;
      }
    } else {
      app.showTopTips(_this, '请选择至少一项');
    }
  },
  /**
   * 添加联合跟进人
   */
  addFollowList(e) {
    let _this = this;

    wx.showNavigationBarLoading();
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/team/addTeamMembers',
      data: e,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        if (res.statusCode === 200 && res.data.isSuccess == 'true') {
          wx.hideNavigationBarLoading(); 
          /**
           * 通过getCurrentPages() 通知首页更改状态
           * tabNO -> 切换tabs位置； pageInfo: 执行的事件标识（查看父级onShow生命周期）
           */
          let currPage = getCurrentPages();
          wx.navigateBack({
            success: res => {
              currPage[currPage.length - 2].data.currPage = {
                tabNo: 2,
                pageInfo: 'team'
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
   * 更换负责人
   */
  replaceCharge(e) {
    let _this = this;
    
    wx.showNavigationBarLoading();
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/team/changeTeamMember',
      data: e,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        if (res.statusCode === 200 && res.data.isSuccess == 'true') {
          wx.hideNavigationBarLoading();
          // 通过getCurrentPages() 通知首页更改状态
          // tabNO -> 切换tabs位置； pageInfo: 执行的事件标识（查看父级onShow生命周期）
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
    });
  },
  /**
   * 获取列表
   */
  getAllMembers() {
    let _this = this;
    wx.request({
      url: globalData.uiasApiUrl + '/api/wxxcx/user/getAllMembers',
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
        if (res.statusCode === 200 && data.isSuccess === 'true') {
          let contactData = data.privCustomUserVoList;
          let listCount = 0;
          for (var key in contactData) {
            for (var i = 0; i < contactData[key].length; i++) {
              var randomNum = Math.random() * 5;
              contactData[key][i].bgColor = colorList[Math.floor(randomNum)];
              // 计算联系人总数，显示
              listCount++;
            }
          }
          _this.setData({
            contactArr: contactData,
            contactCount: listCount,
            firstRefresh: false
          });
        } else {
          app.showTopTips(_this, '无法获取列表');
        }
      }
    });
  },
  /**
   * 选择人员
   */
  contactChange(e) {
    var values = e.detail.value;
    var checkedVal = e.currentTarget.dataset.sort;
    var ckboxItems = this.data.contactArr[checkedVal];
    var ckboxData = this.data.contactArr;

    for (var i = 0; i < ckboxItems.length; i++) {
      ckboxItems[i].checked = false;
      for (var j = 0; j < values.length; j++) {
        if ((ckboxItems[i].userId + '_' + ckboxItems[i].userName) == values[j]) {
          ckboxItems[i].checked = true;
          break;
        }
      }
    }
    
    this.setData({
      contactArr: this.data.contactArr
    });
  },
  /**
   * 滑动字母排序
   */
  bindSideBar(e) {
    let _this = this;
    let pageIndex = e.changedTouches[0].pageY;
    /**
     * （pageY - sidebar距离顶部的40px）/ sidebarItem的高度
     */
    let sideIndex = (pageIndex - 40) / ((_this.data.winHeight - 80) / _this.data.sliderRight.length);
    let sideWord = _this.data.sliderRight[parseInt(sideIndex)];

    if (pageIndex > 40 && pageIndex < _this.data.winHeight - 40) {
      _this.setData({
        toView: sideWord,
        sidePromptTop: pageIndex - 50,
        sidePrompt: true
      })
    } else {
      _this.setData({
        sidePrompt: false
      })
    }
  },
  bindSideHidden() {
    this.setData({
      sidePrompt: false
    })
  }
})