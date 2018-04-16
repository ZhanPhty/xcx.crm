// pages/saleRecord/saleRecordDetail.js
const app = getApp()
const globalData = app.globalData;
import WxRequest from '../../utils/request/index'


Page({
  data: {
    detailId: '',
    oprType: '',
    toUser: '',
    toUserName: '',
    loginId: '',
    saleDateHd: [],
    saleReplyList: [],
    // 是否有回复列表
    saleReply: false,
    // 发送按钮
    saleBtnDis: true,
    // text获得焦点
    isReplyFocus: false,
    salePlaceholder: '请输入回复',
    // 显示输入框上面的回复...
    isReplyList: false,
    // 首次加载数据
    firstSaleDetail: true,
    refreshing: false,
  },
  onLoad: function (options) {
    this.WxRequest = new WxRequest({
      baseURL: globalData.uiasApiUrl,
    })

    this.setData({
      detailId: options.saleId,
      oprType: options.oprType
    });

    this.loadRecordDetail();
  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    const _this = this
    if (!_this.data.refreshing) {
      wx.startPullDownRefresh({
        success() {
          _this.setData({
            refreshing: true
          });
          _this.loadRecordDetail();
        }
      })
    }
  },
  /**
   * 数据提交
   */
  submitForm(e) {
    let _this = this;
    let params = e.detail.value;

    if (params.replyDesc === '') return false
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/saleRecordReply/pdRecordReply',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token,
        saleRecordId: _this.data.detailId,
        toUser: params.toUser,
        replyDesc: params.replyDesc
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        let data = res.data;
        if (res.statusCode === 200 && data.isSuccess === 'true') {
          wx.showToast({
            title: '回复成功',
            icon: 'success',
            duration: 2000,
            success: succ => {
              _this.loadRecordDetail();
              _this.replyListCancel(); 
              _this.setData({
                replyDesc: '',
                saleBtnDis: true
              });
            }
          })
        }
      }
    });
  },
  /**
   * 销售记录详情
   */
  loadRecordDetail() {
    let _this = this;
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/saleRecordReply/getRecordReplyList',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token,
        saleRecordId: _this.data.detailId,
        oprType: _this.data.oprType
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        let data = res.data;
        if (res.statusCode === 200 && data.isSuccess === 'true') {
          wx.stopPullDownRefresh();
          _this.setData({
            saleDateHd: data.data[0],
            loginId: data.loginUserId,
            toUser: data.data[0].createUserId,
            firstSaleDetail: false,
            refreshing: false
          });

          /**
           * 当toUser不为空时有回复
           * saleReply -> true
           */
          if (data.data[0].toUser != null) {
            const listData = data.data.map(d => {
              const userName = _this.selectPrivUser(d.toUser).then(res => {
                if (res.statusCode === 200) {
                  let userName = res.data.privUser.userName
                  d.toUserName = userName
                }
              });
              return d
            })
            setTimeout(() => {
              _this.setData({
                saleReplyList: listData,
                saleReply: true
              });
            }, 200)
          } else {
            _this.setData({
              saleReply: false
            });
          }
        }
      }
    });
  },
  /**
   * 删除回复
   */
  delReplyList(e) {
    let replyId = e.currentTarget.dataset.replyId;
    let _this = this;
    wx.showModal({
      title: '删除回复',
      content: '是否删除此条回复？',
      confirmText: '删除',
      confirmColor: '#f40',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: globalData.crmApiUrl + '/api/wxxcx/crm/saleRecordReply/delRecordReply',
            data: {
              uias_session: globalData.uias_session,
              token: globalData.token,
              relyId: replyId
            },
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            complete: cmp => {
              let data = cmp.data;
              if (cmp.statusCode === 200 && data.isSuccess === 'true') {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 2000,
                  success: succ => {
                    _this.loadRecordDetail();
                    _this.replyListCancel();
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
   * 记录详情列表回复
   */
  replyListToUser(e) {
    const _this = this;
    const toUserId = e.currentTarget.dataset.toUser;
    const userName = e.currentTarget.dataset.toUserName;

    _this.setData({
      isReplyFocus: true,
      isReplyList: true,
      toUser: toUserId,
      toUserName: userName,
      salePlaceholder: '回复 ' + userName
    });
  },
  /**
   * 记录详情列表取消回复
   */
  replyListCancel(e) {
    let _this = this;

    _this.setData({
      isReplyList: false,
      toUser: _this.data.saleDateHd.createUserId,
      salePlaceholder: '请输入回复'
    });
  },
  /**
   * 判断输入字数
   */
  saleReplyInput(e) {
    let txtNum = e.detail.cursor;
    if (txtNum > 0) {
      this.setData({
        saleBtnDis: false
      });
    } else {
      this.setData({
        saleBtnDis: true
      });
    }
  },
  /**
   * 通过userId获取userName
   * 使用Promise异步取值
   */
  selectPrivUser(e) {
    return this.WxRequest.request({
      url: '/api/wxxcx/user/selectPrivUserApi',
      method: 'POST',
      data: {
        userId: e
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    })
  }
})