// pages/personal/extension.js
const app = getApp()
const globalData = app.globalData;
var qrCode = require("../../utils/qrcode.js");

Page({
  data: {
    placeholder: app.globalUrlBase.regUrlBase,
    imagePath: '',
    detailId: ''
  },
  onLoad(options) {
    this.setData({
      detailId: options.userId
    })
    
    var initUrl = this.data.placeholder + '?referId=' + options.userId;
    this.createQrCode(initUrl, "extensionCanvas", 300, 300);

    wx.showLoading({
      title: '生成中...',
    })
  },
  createQrCode: function (url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    qrCode.api.draw(url, canvasId, cavW, cavH);
    setTimeout(() => { this.canvasToTempImage(canvasId) }, 1000);

  },
  //获取临时缓存照片路径，存入data中
  canvasToTempImage(canvasId) {
    var _this = this;
    wx.canvasToTempFilePath({
      canvasId: canvasId,
      success: (res) => {
        var tempFilePath = res.tempFilePath;
        wx.hideLoading();
        _this.setData({
          imagePath: tempFilePath
        });
      }
    });
  },
  /**
   * 点击图片进行预览，长按保存分享图片
   */
  previewImg: function (e) {
    var img = this.data.imagePath;
    wx.previewImage({
      current: img,
      urls: [img]
    })
  },
})