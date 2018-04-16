/**
 * checkbox-group 组件设置checkbox多选功能
 * @author zhanpthy
 * @param {array} ckItems select的总数据
 * @param {string} key 循环对比的值
 * @param {string} name 页面显示的值
 * @param {string} findOf 查找到finOf后清除其他选中项，只保留findOf当前项（达到“不限”选项等功能）
 * @return {array} 返回1: 添加checked后的ckItems，2: 用于提交的值，3: 页面显示的值 
 */
function updateCkBox(ckItems, vals, key, name, findOf) {
  let names = ['请选择'];
  if (typeof vals !== 'object') {
    vals = vals.split(',');
  }
  
  if (vals.indexOf(findOf) > 0) {
    vals = [findOf];
  } else if (vals.indexOf(findOf) === 0 && vals.length != 1) {
    vals.splice(0,1);
  }

  for (var i = 0; i < ckItems.length; ++i) {
    ckItems[i].checked = false;
    for (var j = 0; j < vals.length; ++j) {
      if (ckItems[i][key] == vals[j]) {
        ckItems[i].checked = true;
        names[j] = ckItems[i][name];
        break;
      }
    }
  }

  return {ckItems: ckItems, values: vals, names: names};
}

module.exports = {
  updateCkBox: updateCkBox
}