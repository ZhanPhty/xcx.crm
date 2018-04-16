const app = getApp();
const globalData = app.globalData;
import WxValidate from '../../utils/WxValidate';
import { $select } from '../../template/xcx'

Page({
  data: {
    detailId: '',
    mainId: '',
    oprType: '',
    mainProShow: false,
    mainSurface: [],
    mainSurfaceIndex: 124,
    thickList: [],
    thickIndex: 0,
    mainWidth: [],
    mainThick: [],
    mainToler: [],
    widthName: '请选择',
    thickName: '请选择',
    isUpdate: false,
    // 默认值
    minThick: '',
    maxThick: '',
    minWidth: '1219',
    maxWidth: '1260',
  },
  onLoad: function (options) {
    this.setData({
      detailId: options.id,
      mainId: options.mainId,
      oprType: options.oprType
    });
    // 初始化页面
    this.getMainProView();
    this.getUpdateMainView(options); //编辑模式
  },
  submitForma(e) {
    let params = e.detail.value;
    if (this.data.isUpdate) {
      this.addAddressForm(params, 'update');
    } else {
      this.addAddressForm(params);
    }
  },
  /**
   * 获取页面数据
   */
  getMainProView(e) {
    let _this = this;
    wx.request({
      url: globalData.crmApiUrl + '/api/wxxcx/crm/clientMainProduct/addCrmMainProductInit',
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
          res.data.MATERIALSURFACE.unshift({ "dictName": "请选择" });
          res.data.MAINPROTHICK.unshift({ "dictName": "请选择" });
          
          _this.setData({
            mainSurface: data.MATERIALSURFACE,
            thickList: data.MAINPROTHICK,
          });
          
          _this.bindSelectList('A', data.mnfctName, ['-1'])
          _this.bindSelectList('B', data.mnfctName, ['-1'])
          _this.bindSelectList('C', data.depotCity, ['不限交货地'])
        }
      }
    })
  },
  /**
   * 编辑模式 - 编辑主营产品
   */
  getUpdateMainView(e) {
    let _this = this;
    if (e.pageType === 'update') {
      wx.setNavigationBarTitle({
        title: '修改主营产品'
      });

      wx.request({
        url: globalData.crmApiUrl + '/api/wxxcx/crm/clientMainProduct/updateCrmMainProductInit',
        data: {
          uias_session: globalData.uias_session,
          token: globalData.token,
          mainId: _this.data.mainId
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        complete: res => {
          if (res.statusCode === 200 && res.data.isSuccess === 'true') {
            let data = res.data.clientProductDto;
            _this.setData({
              isUpdate: true,
              minThick: data.referThickMin,
              maxThick: data.referThickMax,
              minWidth: data.widthMin,
              maxWidth: data.widthMax,
            });

            setTimeout(() => {
              for (var i = 0; i < _this.data.mainSurface.length; i++) {
                if (_this.data.mainSurface[i].dictValue === data.qualitySurface) {
                  _this.setData({
                    mainSurfaceIndex: i
                  })
                }
              }

              for (var i = 0; i < _this.data.thickList.length; i++) {
                if (_this.data.thickList[i].dictValue === data.thick) {
                  _this.setData({
                    thickIndex: i
                  })
                }
              }

              _this.selectWidth.render(data.mnfctNames)
              _this.selectThick.render(data.nMnfctNames)
              _this.selectTolerance.render(data.areaNames)
            }, 100);
          }
        }
      });
    }
  },
  /**
   * 提交数据
   */
  addAddressForm(e, pageType) {
    let _this = this;
    let url = '';
    wx.showNavigationBarLoading();
    e['uias_session'] = globalData.uias_session;
    e['token'] = globalData.token;
    e['clientId'] = _this.data.detailId;

    if (pageType === 'update') {
      // 修改地址接口
      e['mainId'] = _this.data.mainId;
      url = '/api/wxxcx/crm/clientMainProduct/updateCrmMainProduct';
    } else {
      url = '/api/wxxcx/crm/clientMainProduct/addCrmMainProduct';
    }

    wx.request({
      url: globalData.crmApiUrl + url,
      data: e,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      complete: res => {
        setTimeout(function () {
          wx.hideNavigationBarLoading()
        }, 500);
        if (res.statusCode === 200 && res.data.isSuccess === 'true') {
          /**
           * 通过getCurrentPages() 通知首页更改状态
           * tabNO -> 切换tabs位置； pageInfo: 执行的事件标识（查看父级onShow生命周期）
           */
          let currPage = getCurrentPages();
          wx.navigateBack({
            success: res => {
              currPage[currPage.length - 2].data.currPage = {
                tabNo: 3,
                pageInfo: 'mainpro'
              };
            }
          });
        } else {
          app.showTopTips(_this, res.data.msg);
        }
      }
    })
  },
  /**
   * 切换picker
   */
  bindSurface(e) {
    this.setData({
      mainSurfaceIndex: e.detail.value
    });
  },
  bindThick(e) {
    this.setData({
      thickIndex: e.detail.value
    });
  },
  /**
   * 显示多选popup组件（公用一个）
   * selectType -> 点击的风格: A - 宽度； B - 厚度； C - 公差；
   */
  toggleSelect(e) {
    if (e.currentTarget.dataset.selectType === 'A'){
      this.selectWidth.show()
    } else if (e.currentTarget.dataset.selectType === 'B') {
      this.selectThick.show()
    } else if (e.currentTarget.dataset.selectType === 'C'){
      this.selectTolerance.show()
    }
  },
  /**
   * 多选popup组件传递数据
   * selectType -> 点击的风格: A - 宽度； B - 厚度； C - 公差；
   */
  bindSelectList(selectType = 'A', items, vals) {
    let itemVal = this.formatJson(items)
    if (selectType === 'A'){
      itemVal.unshift({ 'dictName': '不限钢厂', 'dictValue': '-1'});
      this.selectWidth = $select.init('width', {
        checkItems: itemVal,
        dictName: 'dictName',
        dictValue: 'dictValue',
        chosenValue: vals,
        findOf: '-1',
        onChange: (e) => {
          this.setData({
            widthName: e.chosenName,
            width: e.chosenValue
          })
        }
      })
    } else if (selectType === 'B') {
      itemVal.unshift({ 'dictName': '无需排除钢厂', 'dictValue': '-1' });
      this.selectThick = $select.init('thick', {
        checkItems: itemVal,
        dictName: 'dictName',
        dictValue: 'dictValue',
        chosenValue: vals,
        findOf: '-1',
        onChange: (e) => {
          this.setData({
            thickName: e.chosenName,
            thick: e.chosenValue
          })
        }
      })
    } else if (selectType === 'C'){
      itemVal.unshift({ 'dictName': '不限交货地', 'dictValue': '不限交货地' });
      this.selectTolerance = $select.init('tolerance', {
        checkItems: itemVal,
        dictName: 'dictName',
        dictValue: 'dictValue',
        chosenValue: vals,
        findOf: '不限交货地',
        onChange: (e) => {
          this.setData({
            toleranceName: e.chosenName,
            tolerance: e.chosenValue
          })
        }
      })
    }
  },
  // 格式化厂家json数据类型
  formatJson(array) {
    let arr = []
    array.forEach((val, i) => {
      arr.push({ 'dictName': val, 'dictValue': val,})
    })

    return arr
  }
})