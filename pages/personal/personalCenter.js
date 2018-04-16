// pages/personal/personalCenter.js
const app = getApp()
const globalData = app.globalData;

Page({
  data: {
    detailId: '',
    privUser: {}
  },
  onLoad(options) {
    this.loadUserInfo();
  },
  loadUserInfo() {
    let _this = this;

    wx.request({
      url: globalData.uiasApiUrl + '/api/wxxcx/user/personal',
      data: {
        uias_session: globalData.uias_session,
        token: globalData.token
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        let _this = this;
        let data = res.data;
        if (res.statusCode === 200 && data.isSuccess === 'true') {
          data.privUserMsg['thumb'] = globalData.uiasImgUrl + '/' + data.privUserMsg.thumb;
          _this.setData({
            detailId: data.privUserMsg.userId,
            privUser: data.privUserMsg
          });
        }
      }
    });
  },
  /**
   * 退出登录
   */
  bindSignOut() {
    /**
     * 移除storage后跳转登录页
     */
    wx.removeStorage({
      key: 'UIAS_SESSION',
      success: rem => {
        wx.reLaunch({
          url: '../login/login'
        });
      }
    });
  }
})