 // pages/pageClient/clientDetail.js
const app = getApp()
const globalData = app.globalData;
const colorList = app.globalVariable.colorList;
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;

import { $tabs } from '../../template/xcx'
import { $actionsheet } from '../../template/xcx'
import { $dialog } from '../../template/xcx'

Page({
  data: {
    detailId: '',
    tabs: [{
      id: 0,
      title: '详情信息'
    }, {
      id: 1,
      title: '销售记录'
    }, {
      id: 2,
      title: '地址'
    }, {
      id: 3,
      title: '主营产品'
    }, {
      id: 4,
      title: '销售团队'
    }],
    selectedId: 0,
    // 更多菜单列表
    popupMenu: [
      {
        index: 1,
        text: '更换负责人'
      },
      {
        index: 2,
        text: '添加联合跟进人'
      },
      {
        index: 4,
        text: '新增地址'
      },
      {
        index: 5,
        text: '新增主营产品'
      },
      {
        index: 6,
        text: '作废'
      },
      {
        index: 7,
        text: '退回'
      },
    ],
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
    // 地址
    firstAdd: true,
    addressList: [],
    // 主营产品
    firstMainBuis: true,
    mainBuisList: [],
    // 相关团队
    firstTeam: true,
    teamClueList: [],
    poolIdIndex: 0
  },
  onShow() {
    /**
     * 发布记录成功返回成功状态，并执行相关事件
     */
    var _this = this;
    setTimeout(function () {
      if (_this.data.currPage != undefined) {
        let pageTabNo = _this.data.currPage.tabNo;
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
        } else if (_this.data.currPage.pageInfo === 'address') {
          wx.showToast({
            title: '操作成功',
            icon: 'success',
            duration: 2000
          });

          // 加载地址
          _this.loadAddress();
        } else if (_this.data.currPage.pageInfo === 'mainpro') {
          wx.showToast({
            title: '操作成功',
            icon: 'success',
            duration: 2000
          });

          // 加载地址
          _this.loadMainPro();
        } else if (_this.data.currPage.pageInfo === 'team') {
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 2000
          });

          // 加载团队
          pageTabNo = 4;
          _this.loadTeamList();
        }

        // 执行编辑添加事件才初始化tabs
        if (_this.data.currPage.pageInfo != '') {
          _this.tabs.update(pageTabNo)
          _this.setData({
            ['currPage.pageInfo']: ''
          });
        }
      }
    }, 30);
  },
  onLoad(options) {
    let _this = this;
    wx.getSystemInfo({
      success: res => {
        _this.setData({
          winHeight: res.windowHeight - (49 + 44),
          detailId: options.clientId
        });
      }
    });

    // 加载tabs
    this.initTabs();

    /**
     * 加载详情页
     */
    this.loadDateilInfo();

    /**
     * 实例化API核心类
     */
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
      url: globalData.crmApiUrl + '/api/wxxcx/crm/client/myClientDetailClientInfo',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token,
        clientId: _this.data.detailId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        let data = res.data.clientVo;
        let tempInfoData = [], tempOpen = [], tempAuto = [], tempSys = [];
        if (res.data.isSuccess === 'true') {
          tempInfoData = [
            {
              'name': '客户名称',
              'data': data.clientName
            },
            {
              'name': '客户来源',
              'data': data.clientSource
            },
            {
              'name': '已开通产品',
              'data': data.businessName
            },
            {
              'name': '客户属性',
              'data': data.clientType
            },
            {
              'name': '客户级别',
              'data': data.clientLevel
            }
          ];

          tempOpen = [
            {
              'name': '摊位号',
              'data': data.firmId
            },
            {
              'name': '所属客户池',
              'data': data.seaName
            }
          ];

          tempAuto = [
            {
              'name': '公司名称',
              'data': data.companyName
            },
            {
              'name': '公司类型',
              'data': data.companyType
            },
            {
              'name': '主营行业',
              'data': data.tradeType
            },
            {
              'name': '公司规模',
              'data': data.companySize
            },
            {
              'name': '公司法人',
              'data': data.legalPerson
            },
            {
              'name': '公司座机',
              'data': data.phone
            },
            {
              'name': '公司传真',
              'data': data.fax
            },
            {
              'name': '网址',
              'data': data.url
            },
            {
              'name': '所在城市',
              'data': data.province + data.city + data.county
            },
            {
              'name': '详细地址',
              'data': data.address
            },
            {
              'name': '公司简介',
              'data': data.companyInfo
            },
            {
              'name': '备注',
              'data': data.notes
            }
          ];

          tempSys = [
            {
              'name': '状态',
              'data': data.clientStatus
            }, 
            {
              'name': '最后登录',
              'data': data.lastLoginDate
            },
            {
              'name': '线索创建',
              'data': data.clueCreateDate,
              'user': data.clueCreateUser
            },
            {
              'name': '线索转换',
              'data': data.clueChangeDate,
              'user': data.clueChangeUser
            },
            {
              'name': '客户创建',
              'data': data.createDate,
              'user': data.createUser
            },
            {
              'name': '客户跟进',
              'data': data.lastFollowDate,
              'user': data.lastFollowUser
            }, 
            {
              'name': '负责人变更次数',
              'data': data.changeCnt
            }, 
            {
              'name': '客户冬眠次数',
              'data': data.sleepCnt
            }
          ];

          _this.setData({
            dateilClue: data,
            dateilInfo: tempInfoData,
            dateilOpen: tempOpen,
            dateilAuth: tempAuto,
            dateilSys: tempSys,
            firstDetail: false
          })

        }
      }
    });
  },
  /**
   * 编辑客户
   */
  updateClient() {
    wx.navigateTo({
      url: '../addClient/addClient?id=' + this.data.detailId + '&pageType=update',
    });
  },
  /**
   * 销售记录列表
   */
  loadsaleRecord(type) {
    let _this = this;

    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/saleRecord/clientSaleRecordList',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token,
        pageNo: _this.data.pageNo,
        clientId: _this.data.detailId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        let data = res.data;
        var saleRecordVo = [];

        if (res.data.isSuccess === 'true') {
          /**
           * 设置随机头像和颜色
           */
          for (var i = 0, len = data.saleRecordVos.length; i < len; ++i) {
            var randomNum = Math.random() * 5;
            data.saleRecordVos[i].bgColor = colorList[Math.floor(randomNum)];
          }

          if (type === 'refresh') {
            setTimeout(function () {
              wx.hideLoading();
              _this.setData({
                scrollStatus: ''
              })
            }, 500);
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

          /**
           * 全部数据加载完成后，当总数小于一页所显示的数量执行动作
           */
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
      url: '../saleRecord/saleRecordDetail?saleId=' + e.currentTarget.dataset.saleId + '&oprType=C'
    });
  },
  /**
   * 地址列表
   */
  loadAddress() {
    let _this = this;
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/clientAddress/page',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token,
        clientId: _this.data.detailId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        let data = res.data;
        if (res.statusCode === 200) {
          _this.setData({
            addressList: data.clientAddressVos,
            firstAdd: false
          })
        }
      }
    });
  },
  /**
   * 新增地址
   */
  addAddress() {
    wx.navigateTo({
      url: './clientAddress?id=' + this.data.detailId + '&addId=' + '&oprType=C'
    });
  },
  /**
   * 编辑地址
   */
  updateAddress(e) {
    let addId = e.currentTarget.dataset.addressId;
    wx.navigateTo({
      url: './clientAddress?id=' + this.data.detailId + '&addId=' + addId + '&oprType=C&pageType=update',
    });
  },
  /**
   * 更新主地址
   */
  updateAddressDefault(e) {
    let addId = e.currentTarget.dataset.addressId;
    let _this = this;
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/clientAddress/updateAddressIsDefault',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token,
        clientId: _this.data.detailId,
        addressId: addId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        let data = res.data;
        
        if (res.statusCode === 200 && data.isSuccess === 'true') {
          wx.showToast({
            title: '设置成功',
            duration: 2000
          })
          _this.loadAddress()
        } else {
          app.showTopTips(_this, data.msg);
        }
      }
    });
  },
  /**
   * 主营产品
   */
  loadMainPro() {
    let _this = this;
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/clientMainProduct/clientProductVoList',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token,
        clientId: _this.data.detailId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        let data = res.data;
        if (res.statusCode === 200 && data.isSuccess === 'true') {
          _this.setData({
            mainBuisList: data.clientProductVos,
            firstMainBuis: false
          })
        }
      }
    });
  },
  /**
   * 添加主营产品
   */
  addMainPro() {
    wx.navigateTo({
      url: './clientMainPro?id=' + this.data.detailId + '&mainId=' + '&oprType=C',
    });
  },
  /**
   * 编辑主营产品
   */
  updateMainPro(e) {
    let mainId = e.currentTarget.dataset.mainId;
    wx.navigateTo({
      url: './clientMainPro?id=' + this.data.detailId + '&mainId=' + mainId + '&oprType=C&pageType=update',
    });
  },
  /**
   * 删除主营产品
   */
  delMainPro(e) {
    let _this = this;
    let mainId = e.currentTarget.dataset.mainId;

    wx.showModal({
      title: '删除主营产品',
      content: '是否删除此条主营产品？',
      confirmText: '删除',
      confirmColor: '#f40',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: globalData.crmApiUrl + '/api/wxxcx/crm/clientMainProduct/deleteCrmMainProduct',
            data: {
              uias_session: globalData.uias_session,
              token: globalData.token,
              mainId: mainId
            },
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            complete: res => {
              let data = res.data;
              if (res.statusCode === 200 && data.isSuccess === 'true') {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 2000,
                  success: succ => {
                    _this.loadMainPro();
                  }
                })
              }
            }
          });
        }
      }
    });
  },
  /**
   * 添加销售记录
   */
  addSaleRecord() {
    wx.navigateTo({
      url: '../saleRecord/addSaleRecord?id=' + this.data.detailId + '&oprType=C',
    });
  },
  /**
   * 添加联合跟进人
   */
  addJointFollow() {
    wx.navigateTo({
      url: '../selectContact/contactList?id=' + this.data.detailId + '&oprType=C&operation=follow',
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
              oprType: 'C',
              userIds: e.currentTarget.dataset.detailid,
              clientIds: _this.data.detailId
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
      url: '../selectContact/contactList?id=' + this.data.detailId + '&oprType=C&operation=charge',
    })
  },
  /**
   * 作废客户
   */
  clientToVoid(e) {
    let _this = this;
    this.dialog = $dialog.init({
      title: '作废客户',
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
                url: globalData.crmApiUrl + '/api/wxxcx/crm/client/clientInvalid',
                data: {
                  uias_session: globalData.uias_session,
                  token: globalData.token,
                  clientIds: _this.data.detailId,
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

                        // 隐藏dialog
                        _this.dialog.hide()
                      }
                    });
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
   * 退回客户
   */
  clientReturn() {
    let _this = this;

    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/clientSea/getUserSeas',
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
            poolId: data.seaNameList,
            invaliddata: {
              show: true,
              title: '退回客户',
              name: 'seaId',
            }
          })
        }
      }
    });
  },
  /**
   * 退回客户 - 选择客户
   */
  bindpoolId(e) {
    this.setData({
      poolIdIndex: e.detail.value
    })
  },
  /**
   * 退回客户 - 取消
   */
  hideDialog() {
    this.setData({
      invaliddata: {
        show: false,
      }
    })
  },
  /**
   * 退回客户 - 确定
   */
  submitDialog(e) {
    let vals = e.detail.value;
    let _this = this;
    if (vals.oprDesc != '') {
      wx.request({
        url: globalData.crmApiUrl + '/api/wxxcx/crm/client/clientBack',
        data: {
          uias_session: globalData.uias_session,
          token: globalData.token,
          oprDesc: vals.oprDesc,
          seaId: vals.seaId,
          clientIds: _this.data.detailId
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
      url: globalData.crmApiUrl + '/api/wxxcx/crm/team/clientTeamList',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token,
        pageNo: 1,
        clientId: _this.data.detailId
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        let data = res.data;
        var teamPersonArray = [], teamFollowArray = [];

        if (res.statusCode === 200) {
          /**
           * 设置随机头像和颜色
           */
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
   * 更多按钮展开的菜单列表
   */
  bindMore() {
    let _this = this;
    $actionsheet.init({
      buttons: this.data.popupMenu,
      buttonClicked(index, e) {
        switch (index + 1) {
          case 0:
            _this.updateClient();
            break;
          case 1:
            _this.replaceCharge();
            break;
          case 2:
            _this.addJointFollow();
            break;
          case 3:
            _this.addAddress();
            break;
          case 4:
            _this.addMainPro();
            break;
          case 5:
            _this.clientToVoid();
            break;
          case 6:
            _this.clientReturn();
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
      scroll: true,
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
        if (this.data.firstAdd) {
          this.loadAddress();
        }
        break;
      case 3:
        if (this.data.firstMainBuis) {
          this.loadMainPro();
        }
        break;
      case 4:
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
   * 地图定位
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
  /**
   * 拨打电话
   */
  callPhone(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.mobile
    })
  }
})