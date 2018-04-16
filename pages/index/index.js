//获取应用实例
const app = getApp()
const globalData = app.globalData;

Page({
  onLoad: function () {
    /**
     * 检测storage是否存在，判断用户是否登录
     */
    wx.getStorage({
      key: 'UIAS_SESSION',
      success: res => {
        /**
         * 存在登录成功, 判断本地登录状态和后台是否匹配
         */
        wx.request({
          url: globalData.uiasApiUrl + '/api/wxxcx/auth/vaildSession',
          data: {
            uias_session: res.data,
            token: globalData.token
          },
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          complete(data) {
            if (data.statusCode === 200 && data.data.isSuccess === 'true') {
              /**
               * 更新全局变量, 用于其他页面之间调用3rd_session
               */
              globalData.uias_session = res.data;

              wx.switchTab({
                url: '../pageClue/pageClue'
              })
            } else {
              wx.showModal({
                title: '提示',
                content: '登录失效，请重新登录',
                showCancel: false,
                confirmText: '去登陆',
                success: succ => {
                  if (succ.confirm) {
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
                }
              });
            }
          }
        });
      }
    });
  }
})
