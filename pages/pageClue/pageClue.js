// pages/transfer/transfer.js
const app = getApp()
const globalData = app.globalData;
import { $tabs } from '../../template/xcx'

Page({
  data: {
    tabs: [{
      id: 0,
      icon: 'Home',
      title: '场景'
    }],
    // 场景、筛选状态
    changeType: 'A',
    privUserList: [],
    menuList: [{
      checked: true,
      changeValue: 'A',
      changeName: '全部的销售线索'
    }, {
      checked: false,
      changeValue: 'B',
      changeName: '我负责的线索'
    }, {
      checked: false,
      changeValue: 'C',
      changeName: '我参与的线索'
    }, {
      checked: false,
      changeValue: 'D',
      changeName: '我下属负责的线索'
    }, {
      checked: false,
      changeValue: 'E',
      changeName: '我下属参与的线索'
    }],
    sceneActive: false,
    searchActive: false,
    //上拉加载、下拉刷新
    dataList: [],
    pageStart: 0,
    pageLength: 15, // 一页数据条数
    firstRefresh: true,
    updateRefresh: false,
    updateComplete: false,
    refreshing: false
  },
  onShow() {
    let _this = this;
    // 更新数据后返回页面是触发
    setTimeout(function () {
      if (_this.data.currPage != undefined) {
        if (_this.data.currPage.pageInfo === 'success' || _this.data.currPage.pageInfo === 'team') {
          wx.startPullDownRefresh({})
          wx.showToast({
            title: '操作成功',
            duration: 2000
          })
        }

        // 执行编辑添加事件才初始化tabs
        if (_this.data.currPage.pageInfo != '') {
          _this.setData({
            ['currPage.pageInfo']: ''
          });
        }
      }
    }, 30);
  },
  onLoad() {
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          menuHeight: res.windowHeight - (44 + 46 + 40)
        });
      }
    });

    // 加载tabs
    this.initTabs();

    /**
     * 先请求getPrivUserList获取userId，再请求listLoad；
     */
    _this.getPrivUserList();
  },
  sceneChage(e) {
    var menuList = this.data.menuList;
    for (var i = 0, len = menuList.length; i < len; ++i) {
      menuList[i].checked = menuList[i].changeValue == e.detail.value;
    }

    this.setData({
      changeType: e.detail.value,
      menuList: menuList
    });
    wx.startPullDownRefresh({});
  },
  /**
   * 关闭场景、筛选
   */
  toggleMenuPopup() {
    this.setData({
      sceneActive: false,
      searchActive: false
    });
  },
  cardTakePhoto() {
    let _this = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.navigateTo({
          url: '../addClue/addClue?parseCartUrl=' + res.tempFilePaths + '&pageType=card'
        })
      }
    })
  },
  addClueTo() {
    wx.navigateTo({
      url: '../addClue/addClue'
    })
  },
  onPullDownRefresh() {
    let _this = this;

    if (!_this.data.refreshing) {
      wx.startPullDownRefresh({
        success() {
          _this.setData({
            pageStart: 0,
            updateRefresh: false,
            updateComplete: false,
            refreshing: true
          });
          _this.listLoad('refresh');
        }
      })
    }
  },
  onReachBottom() {
    let _this = this;
    if (_this.data.updateRefresh && !_this.data.updateComplete) {
      _this.setData({
        pageStart: _this.data.pageStart + _this.data.pageLength
      });
      _this.listLoad();
    }
  },
  /**
   * 初始化tabs
   */
  initTabs() {
    let _this = this;
    this.tabs = $tabs.init('list', {
      tabs: this.data.tabs,
      scroll: true,
      fixed: true,
      handleTabChange(e) {
        switch (e.itemId) {
          case 0:
            this.setData({
              sceneActive: !_this.data.sceneActive,
              searchActive: false
            });

            break;
          case 1:
            this.setData({
              sceneActive: false,
              searchActive: !_this.data.searchActive
            });

            break;
        }
      },
    })
  },
  /**
   * 回到顶部
   */
  onPageScroll(e) {
    this.setData({
      pageScrollTop: e.scrollTop
    })
  },
  goPageTop() {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  /**
   * 场景 - 我下属参与
   */
  getPrivUserList() {
    let _this = this;
    wx.request({
      url: globalData.uiasApiUrl + '/api/wxxcx/user/selectMySubordinatesApi',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        if (res.statusCode == 200) {
          let privList = [];
          for (var i = 0; i < res.data.privCustomUserList.length; i++) {
            privList.push(res.data.privCustomUserList[i].userId)
          }

          _this.setData({
            privUserList: privList
          });

          //加载列表数据
          _this.listLoad();
        }
      }
    });
  },
  listLoad(type) {
    let _this = this;
    var length = _this.data.pageLength;
    var start = _this.data.pageStart;
    //获取列表数据
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/clue/pageClue',
      data: {
        uias_session: globalData.uias_session,
        userId: '',
        clueStatus: '',
        changeType: _this.data.changeType,
        userIdArr: _this.data.privUserList,
        start: start,
        length: length,
        token: globalData.token
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        if (res.data.isSuccess == 'true') {
          wx.stopPullDownRefresh();
          var dataList = [];

          /**
           * 判断是不是下拉刷新请求的数据
           */
          if (type === 'refresh') {
            dataList = res.data.data;
            _this.setData({
              dataList: res.data.data
            })
          }

          if (_this.data.dataList.length < res.data.recordsTotal) {
            if (type != 'refresh') {
              dataList = _this.data.dataList.concat(res.data.data);
            }
            _this.setData({
              dataList: dataList,
              updateRefresh: true,
              updateComplete: false,
              refreshing: false,
              firstRefresh: false
            })
          } else {
            _this.setData({
              updateRefresh: false,
              updateComplete: true,
              refreshing: false,
              firstRefresh: false
            })
          }

          /**
           * 全部数据加载完成后，当总数小于一页所显示的数量执行动作
           */
          if (_this.data.dataList.length < _this.data.pageLength) {
            _this.setData({
              updateRefresh: false,
              updateComplete: true
            })
          }
        }
      }
    })
  },
  callPhone(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.mobile
    })
  },
  /**
   * 跳转详情页 - 传递页面id
   */
  bindGoDetail(e) {
    wx.navigateTo({
      url: './pageClueDetail?clueId=' + e.currentTarget.dataset.detailid
    })
  }
})
