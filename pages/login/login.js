//获取应用实例
const app = getApp();
const globalData = app.globalData;
import WxValidate from '../../utils/WxValidate';

Page({
  data: {
    token: globalData.token,
    isPw: true,
    blurPw: false
  },
  onLoad() {
    //初始化表单验证
    this.initValidate();
  },
  submitForm(e) {
    const params = e.detail.value;

    // 传入表单数据，调用验证方法
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0]
      app.showTopTips(this, error.msg);
      return false
    } else {
      this.loginIn(params);
    }
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      loginName: {
        required: true,
      },
      passWord: {
        required: true,
        minlength: 6
      }
    }

    // 验证字段的提示信息
    const messages = {
      loginName: {
        required: '请输入账户'
      },
      passWord: {
        required: '请输入密码',
        minlength: '密码不小于6位'
      }
    }

    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  /**
   * 输入账户密码获取id
   */
  loginIn(e) {
    let _this = this;
    wx.showNavigationBarLoading();

    wx.request({
      url: globalData.uiasApiUrl + '/api/wxxcx/auth/login',
      data: e,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        let data = res.data;
        wx.hideNavigationBarLoading();
        if (res.statusCode === 200 && data.isSuccess === 'true') {
          /**
           * 调用微信登录
           */
          _this.wxLogin(data);
        } else if (res.statusCode === 200 && data.isSuccess === 'false') {
          app.showTopTips(_this, data.msg);
        } else {
          app.showTopTips(_this, '连接服务器失败，检测网络是否正常');
        }
      }
    })
  },
  /**
   * 绑定微信登录
   */
  wxLogin(data) {
    let _this = this;
    wx.showNavigationBarLoading();
    wx.login({
      success: res => {
        if (res.code) {
          wx.request({
            url: globalData.uiasApiUrl + '/api/wxxcx/auth/jscode2session',
            data: {
              uiasAuthToken: data.uiasAuthToken,
              appid: globalData.appid,
              secret: globalData.secret,
              js_code: res.code,
              grant_type: 'authorization_code',
              token: globalData.token
            },
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: userInfo => {
              let loginData = userInfo.data;
              wx.hideNavigationBarLoading();
              if (userInfo.statusCode === 200 && loginData.isSuccess === 'true') {
                /**
                 * 写入3rd_session以及其他用户信息
                 */
                wx.setStorage({
                  key: 'UIAS_SESSION',
                  data: loginData.uias_session
                })
                wx.setStorage({
                  key: 'MOBILE',
                  data: loginData.mobile
                })
                wx.setStorage({
                  key: 'USERNAME',
                  data: loginData.userName
                })

                /**
                 * 跳转页面
                 */
                wx.redirectTo({
                  url: '../index/index',
                })
              } else {
                app.showTopTips(_this, loginData.msg);
              }
            },
            fail: err => {
              app.showTopTips(_this, '连接服务器失败，检测网络是否正常');
            }
          })
        }
      },
      fail: err => {
        app.showTopTips(_this, '登录失败');
      }
    });
  },
  /**
   * 切换密码显示、隐藏
   */
  togglePassWord() {
    this.setData({
      isPw: !this.data.isPw,
      blurPw: true
    })
  },
  blurPw() {
    this.setData({
      blurPw: false
    })
  }
})
