// pages/pageClue/pageClueDetail.js
const app = getApp()
const globalData = app.globalData;
const colorList = app.globalVariable.colorList;
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
import { $tabs, $dialog } from '../../template/xcx'
var qqmapsdk;

Page({
  data: {
    detailId: '',
    tabs: [
      {
        id: 0,
        title: '详情信息'
      }, 
      {
        id: 1,
        title: '销售记录'
      }, 
      {
        id: 2,
        title: '销售团队'
      }
    ],
    selectedId: 0,
    pageNo: 1,
    dateilInfo: [],
    dateilAuth: [],
    dateilSys: [],
    // 详情信息首次加载
    firstDetail: true,
    // 上拉加载
    saleRecordVos: [],
    updateRefresh: false,
    updateComplete: false,
    firstRefresh: true,
    refreshing: false,
    // 相关团队
    firstTeam: true,
    teamClueList: [],
    poolIdIndex: 0
  },
  onShow() {
    // 发布记录成功返回成功状态，并执行相关事件
    var _this = this;
    setTimeout(() => {
      if (_this.data.currPage != undefined) {
        if (_this.data.currPage.pageInfo === 'success') {
          wx.showToast({
            title: '发布成功',
            icon: 'success',
            duration: 2000
          });

          _this.setData({
            pageNo: 1,
            updateRefresh: false,
            updateComplete: false,
            saleRecordVos: [],
            scrollTopRefresh: 0
          });

          _this.loadsaleRecord();
        } else if (_this.data.currPage.pageInfo === 'update') {
          wx.showToast({
            title: '编辑成功',
            icon: 'success',
            duration: 2000
          });

          // 加载详情页
          _this.loadDateilInfo();
        } else if (_this.data.currPage.pageInfo === 'team') {
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 2000
          });

          // 加载详情页
          _this.loadTeamList();
        }

        // 执行编辑添加事件才初始化tabs
        if (_this.data.currPage.pageInfo != '') {
          _this.tabs.update(_this.data.currPage.tabNo)
          _this.setData({
            ['tabs.selectedId']: _this.data.currPage.tabNo,
            ['currPage.pageInfo']: ''
          });
        }
      }
    }, 30);
  },
  onLoad(options) {
    let _this = this;

    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          winHeight: res.windowHeight - (49 + 44),
          detailId: options.clueId
        });
      }
    });

    // 加载tabs
    this.initTabs();

    // 加载详情页
    this.loadDateilInfo();

    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: globalData.mapKey
    });
  },
  /**
   * 下拉刷新
   */
  scrollDownRefresh() {
    let _this = this;

    if (!_this.data.refreshing && _this.data.selectedId === 1) {
      _this.setData({
        pageNo: 1,
        updateRefresh: false,
        updateComplete: false,
        refreshing: true,
        saleRecordVos: [],
        scrollStatus: 'refresh'
      });

      wx.showLoading({
        title: '正在刷新',
        mask: true
      })

      _this.loadsaleRecord('refresh');
    }
  },
  scrollReachBottom(e) {
    let _this = this;
    if (_this.data.updateRefresh && !_this.data.updateComplete) {
      _this.setData({
        pageNo: _this.data.pageNo + 1
      });
      _this.loadsaleRecord();
    }
  },
  /**
   * 获取销售线索详情
   */
  loadDateilInfo() {
    let _this = this;
    //获取列表数据
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/clue/clueDetail',
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
        let data = res.data.clueVo;
        let tempInfoData = [], tempAuto = [], tempSys = [];
        if (res.data.isSuccess === 'true') {
          tempInfoData = [
            {
              'name': '姓名',
              'data': data.person
            },
            {
              'name': '公司',
              'data': data.company
            },
            {
              'name': '线索来源',
              'data': data.clueSourceName
            },
            {
              'name': '线索级别',
              'data': data.clueLevelName
            },
            {
              'name': '线索详情',
              'data': data.clueDesc
            },
            {
              'name': '线索池',
              'data': data.poolName
            },
            {
              'name': '手机',
              'data': data.mobile
            },
            {
              'name': '电话',
              'data': data.phoneNo
            },
            {
              'name': 'QQ',
              'data': data.qq
            },
            {
              'name': '传真',
              'data': data.fax
            },
            {
              'name': '邮箱',
              'data': data.email
            },
            {
              'name': '网址',
              'data': data.url
            },
            {
              'name': '职务',
              'data': data.position
            },
            {
              'name': '主要工作',
              'data': data.mainWork
            },
            {
              'name': '联系人地址',
              'data': data.address
            },
            {
              'name': '主营行业',
              'data': data.tradeType
            }
          ];

          tempAuto = [
            {
              'name': '认证状态',
              'data': data.certStatus
            },
            {
              'name': '失败原因',
              'data': data.certDesc
            }
          ];

          tempSys = [
            {
              'name': '创建',
              'data': data.createDate,
              'user': data.createUser
            },
            {
              'name': '转移',
              'data': data.transDate,
              'user': data.transUser
            },
            {
              'name': '分配',
              'data': data.assignDate,
              'user': data.assignUser
            },
            {
              'name': '最后跟进',
              'data': data.lastFollowDate,
              'user': data.lastFollowUser
            }, {
              'name': '最后修改',
              'data': data.updateDate,
              'user': data.updateUser
            }
          ];

          _this.setData({
            dateilClue: data,
            dateilInfo: tempInfoData,
            dateilAuth: tempAuto,
            dateilSys: tempSys,
            firstDetail: false
          })

        }
      }
    });
  },
  /**
   * 编辑销售线索
   */
  updateClue() {
    wx.navigateTo({
      url: '../addClue/addClue?clueId=' + this.data.detailId + '&pageType=update',
    })
  },
  /**
   * 销售记录列表
   */
  loadsaleRecord(type) {
    let _this = this;

    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/saleRecord/clueSaleRecordList',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token,
        pageNo: _this.data.pageNo,
        clueId: _this.data.detailId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        let data = res.data;
        var saleRecordVo = [];

        if (res.data.isSuccess === 'true') {
          // 设置随机头像和颜色
          for (var i = 0, len = data.saleRecordVos.length; i < len; ++i) {
            var randomNum = Math.random() * 5;
            data.saleRecordVos[i].bgColor = colorList[Math.floor(randomNum)];
          }
          
          if (type === 'refresh') {
            setTimeout(function() {
              wx.hideLoading();
              _this.setData({
                scrollStatus: ''
              })
            }, 600);
            
          }

          if (_this.data.saleRecordVos.length < res.data.totalRecords) {
            saleRecordVo = _this.data.saleRecordVos.concat(data.saleRecordVos);
            
            _this.setData({
              saleRecordVos: saleRecordVo,
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

          // 全部数据加载完成后，当总数小于一页所显示的数量执行动作
          if (_this.data.saleRecordVos.length < data.pageSize) {
            _this.setData({
              updateRefresh: false,
              updateComplete: true
            })
          }
        }
      }
    });
  },
  /**
   * 销售记录详情
   */
  goRecordDetail(e) {
    wx.navigateTo({
      url: '../saleRecord/saleRecordDetail?saleId=' + e.currentTarget.dataset.saleId + '&oprType=A'
    });
  },
  /**
   * 添加销售记录
   */
  addSaleRecord() {
    wx.navigateTo({
      url: '../saleRecord/addSaleRecord?id=' + this.data.detailId + '&oprType=A',
    })
  },
  /**
   * 添加联合跟进人
   */
  addJointFollow() {
    wx.navigateTo({
      url: '../selectContact/contactList?id=' + this.data.detailId + '&oprType=A&operation=follow',
    })
  },
  /**
   * 移除联合跟进人
   */
  removeJointFollow(e) {
    let _this = this;

    wx.showModal({
      title: '移除联合跟进人',
      content: '确定移除联合跟进人吗？',
      confirmText: '移除',
      confirmColor: '#f40',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: globalData.crmApiUrl + '/api/wxxcx/crm/team/removeTeamMembers',
            data: {
              uias_session: globalData.uias_session,
              token: globalData.token,
              oprType: 'A',
              userIds: e.currentTarget.dataset.detailid,
              clueIds: _this.data.detailId
            },
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            complete: res => {
              if (res.statusCode === 200 && res.data.isSuccess === 'true') {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'success',
                  duration: 2000
                });

                _this.loadTeamList();
              } else {
                app.showTopTips(_this, res.data.msg);
              }
            }
          });
        }
      }
    });
  },
  /**
   * 更换负责人
   */
  replaceCharge() {
    wx.navigateTo({
      url: '../selectContact/contactList?id=' + this.data.detailId + '&oprType=A&operation=charge',
    });
  },
  /**
   * 线索作废
   */
  clueToVoid() {
    let _this = this;
    this.dialog = $dialog.init({
      title: '作废线索',
      buttons: [
        {
          text: `取消`,
          type: `weui-dialog__cancel`,
        },
        {
          text: `作废`,
          type: `weui-dialog__del`,
          formType: `submit`,
          onTap(e) {
            const value = e.detail.value
            if (value.invalidDesc != '') {
              wx.request({
                url: globalData.crmApiUrl + '/api/wxxcx/crm/clue/cancelClue',
                data: {
                  uias_session: globalData.uias_session,
                  token: globalData.token,
                  clueIds: _this.data.detailId,
                  invalidDesc: value.invalidDesc
                },
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                complete: res => {
                  let data = res.data;
                  if (res.statusCode === 200 && data.isSuccess === 'true') {
                    let currPage = getCurrentPages();
                    wx.navigateBack({
                      delta: 2,
                      success: res => {
                        currPage[0].data.currPage = {
                          pageInfo: 'team'
                        };
                      }
                    });

                    // 隐藏dialog
                    _this.dialog.hide()
                  } else {
                    app.showTopTips(_this, res.data.msg);
                  }
                }
              });
            } else {
              app.showTopTips(_this, '请填写作废原因');
            }
          },
        }
      ],
      fieldContent: [
        {
          type: 'textarea',
          name: 'invalidDesc',
          placeholder: '请输入作废说明',
        }
      ]
    })
  },
  /**
   * 线索退回
   */
  clueReturn() {
    let _this = this;
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/cluePool/getUserPools',
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
        if (res.statusCode === 200) {
          _this.setData({
            poolId: data.poolList,
            invaliddata: {
              show: true,
              title: '退回线索',
              name: 'poolId',
            }
          })
        }
      }
    });
  },
  /**
   * 线索退回 - 选择客户
   */
  bindpoolId(e) {
    this.setData({
      poolIdIndex: e.detail.value
    })
  },
  /**
   * 线索退回 - 取消
   */
  hideDialog() {
    this.setData({
      invaliddata: {
        show: false,
      }
    })
  },
  /**
   * 线索退回 - 确定
   */
  submitDialog(e) {
    let vals = e.detail.value;
    let _this = this;
    if (vals.oprDesc != '') {
      wx.request({
        url: globalData.crmApiUrl + '/api/wxxcx/crm/clue/clueBack',
        data: {
          uias_session: globalData.uias_session,
          token: globalData.token,
          oprDesc: vals.oprDesc,
          poolId: vals.poolId,
          clueIds: _this.data.detailId
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        complete: res => {
          let data = res.data;
          if (res.statusCode === 200 && data.isSuccess === 'true') {
            let currPage = getCurrentPages();
            wx.navigateBack({
              delta: 2,
              success: res => {
                currPage[0].data.currPage = {
                  pageInfo: 'team'
                };
              }
            });
          } else {
            app.showTopTips(_this, res.data.msg);
          }
        }
      });
    } else {
      app.showTopTips(_this, '请输入退回原因');
    }
  },
  /**
   * 相关团队
   */
  loadTeamList() {
    let _this = this;
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/team/clueTeamList',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token,
        pageNo: 1,
        clueId: _this.data.detailId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        let data = res.data;
        var teamPersonArray = [], teamFollowArray = [];
        
        if (res.statusCode === 200) {
          // 设置随机头像和颜色
          for (var i = 0, len = data.teamClueRelVos.length; i < len; ++i) {
            var randomNum = Math.random() * 5;
            data.teamClueRelVos[i].bgColor = colorList[Math.floor(randomNum)];

            if (data.teamClueRelVos[i].teamRole === 'A') {
              teamPersonArray.push(data.teamClueRelVos[i]);
            } else {
              teamFollowArray.push(data.teamClueRelVos[i]);
            }
          }

          _this.setData({
            teamPersonArray: teamPersonArray,
            teamFollowArray: teamFollowArray,
            firstTeam: false
          })
        }
      }
    });
  },
  /**
   * 转化为客户
   */
  bindChangeClue() {
    wx.navigateTo({
      url: './changeClue?id=' + this.data.detailId
    })
  },
  /**
   * 更多按钮
   */
  bindMore() {
    let _this = this;
    wx.showActionSheet({
      itemList: ['编辑', '添加联合跟进人', '更换负责人', '作废', '退回'],
      success: function (res) {
        switch (res.tapIndex) {
          case 0:
            _this.updateClue();
            break;
          case 1:
            _this.addJointFollow();
            break;
          case 2:
            _this.replaceCharge();
            break;
          case 3:
            _this.clueToVoid();
            break;
          case 4:
            _this.clueReturn();
            break;
        }
      }
    })
  },
  /**
   * 初始化tabs
   */
  initTabs() {
    this.tabs = $tabs.init('detail', {
      tabs: this.data.tabs,
      scroll: false,
      fixed: true,
      handleTabChange(e) {
        this.setData({
          selectedId: e.itemId
        })
      },
    })
  },
  /**
   * 滑动切换tab
   */
  handleTabSwiper(e) {
    // 更新tabs
    this.tabs.update(e.detail.current)

    switch (e.detail.current) {
      case 1:
        if (this.data.firstRefresh) {
          this.loadsaleRecord();
        }
        break;
      case 2:
        if (this.data.firstTeam) {
          this.loadTeamList();
        }
        break;
    }
  },
  /**
   * 回到顶部
   */
  scrollPageTop(e) {
    if (e.detail.scrollTop < -60) {
      this.setData({
        scrollStatus: 'active'
      })
    } else {
      this.setData({
        scrollStatus: ''
      })
    }
    this.setData({
      pageScrollTop: e.detail.scrollTop
    })
  },
  goPageTop() {
    this.setData({
      scrollTopRefresh: 0
    })
  },
  /**
   * 查看地图位置
   */
  consultMap(e) {
    let _this = this;
    wx.showNavigationBarLoading();

    qqmapsdk.geocoder({
      address: e.currentTarget.dataset.map,
      complete: res => {
        wx.hideNavigationBarLoading();
        if (res.status === 0) {
          var result = res.result;
          wx.openLocation({
            latitude: result.location.lat,
            longitude: result.location.lng,
            scale: 28,
            name: result.title,
            address: e.currentTarget.dataset.map
          });
        } else {
          app.showTopTips(_this, res.message, 'prompt');
        }
      }
    })
  },
  callPhone(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.mobile
    })
  }
})