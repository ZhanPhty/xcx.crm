//app.js
App({
  onLaunch: function () {
  },
  onShow: function() {
    var _this = this;
    // 登录拦截
    wx.getStorage({
      key: 'UIAS_SESSION',
      success: function (session) {
        _this.globalData.uias_session = session.data;
      },
      fail: function () {
        wx.reLaunch({
          url: '/pages/login/login'
        })
      }
    })
  },
  // 提示tips通用
  // that -> this; msg -> 消息内容; type -> 风格（warn or info or tips or prompt）; delay -> 延时
  showTopTips: function (that ,msg, type, delay) {
    msg = msg !== undefined ? msg : '提交出错，请联系管理人员';
    delay = delay !== undefined ? delay : 3000;
    type = type !== undefined ? type : 'warn';
    
    that.setData({
      showTopTips: true,
      showErrorMsg: msg,
      showType: type
    });

    if (delay > 0) {
      setTimeout(function () {
        that.setData({
          showTopTips: false
        });
      }, delay);
    }
  },
  // 全局变量
  globalVariable: {
    colorList: ['#ffc2af', '#a8d9ff', '#ffce81', '#c4c3fc', '#b0ecbb']
  },
  // 全局数据
  globalData: {
    userInfo: null,
    /**
     * 开发环境
     */
    crmApiUrl: 'http://192.168.8.245:9802/boss-api-crm-web',
    uiasApiUrl: 'http://192.168.8.245:9804/boss-api-uias-web',
    crmImgUrl: 'http://192.168.8.206/devcrm',
    uiasImgUrl: 'http://192.168.8.206/devuias',

    /**
     * 测试环境
     */
    // crmApiUrl: 'http://192.168.8.246:8203/boss-api-crm-web',
    // uiasApiUrl: 'http://192.168.8.246:8201/boss-api-uias-web',
    // crmImgUrl: 'http://192.168.8.206/qacrm',
    // uiasImgUrl: 'http://192.168.8.206/qauias',

    token: '1C10C8287A1F404EB3A2D80A1FFD4E37',
    appid: 'wxd1beb17b0a199f4d',
    secret: 'e3b649809f196a9e07e2271e0864e92d',
    uias_session: '',
    mapKey: 'NRSBZ-ZOFWR-AD4W3-WLEIZ-WDZEK-IGBJD'
  },
  // 全局买钢乐商城域名
  globalUrlBase: {
    regUrlBase: 'https://test.maigangle.com:5455/maigangle-reg-web'
  }
})