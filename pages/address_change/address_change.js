// pages/address_change/address_change.js
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
const app = getApp()
const address = {
    韩国湖南大学: ['生活馆', '勉学馆', '国际馆','后山','对面'],
    韩国其他地区:['自行输入地址信息'],
    // 全南大学: ['生活馆', '勉学馆'],
    // 朝鲜大学: ['生活馆', ],
};
Page({
    /**
     * 页面的初始数据
     */
    data: {
        //地址信息
        consignee_id:Number,

        //是否展示地址选择框
        show_popup:false,

        value_name:'',

        value_number:'',

        // 选择按钮内容
        select_title:'请选择收货地址',

        value_address:'',

        area:0,

        //地址选择内容
        columns: [
            {
              values: Object.keys(address),
              className: 'column1',
            },
            {
                values: address['韩国湖南大学'],
                className: 'column2',
                defaultIndex: 0,
              },
          ],

          //默认为默认地址
          address_default:true,

          //地址信息提交类型（0：新建地址信息，1：修改地址信息）
          submit_status:Number,

          //收件人姓名为空时，提醒内容
          error_name:'',

          //收件人电话为空时，提醒内容
          error_number:'',

          //未选择收货地址时，提醒内容
          error_area:'',

          //地址详情为空时，提醒内容
          error_address:'',


    },

    // 点击cell弹出选择框
    popup_show(){
        this.setData({show_popup:'true'})
    },

    //更改学校，显示不同宿舍
    address_select(e){
        const { picker, value, index } = e.detail;
        picker.setColumnValues(1, address[value[0]]);
    },
    
    //点击关闭按钮，关闭选择框
    onCancel() {
        this.setData({show_popup:false})       
    },

    //点击确定按钮
    onConfirm(e){
        var detail = e.detail.value
        var index = e.detail.index
        var area = 0
        var address = String
        if(detail[0] == '韩国其他地区'){
            area = 9999
            address = detail[0]
        }else{
            area = Number('10'+index.join(''))
            address = detail.join('')

        }
        if(area != 0) {
            var error_area = ''
        }
        this.setData({select_title:address,show_popup:false,area:area,error_area
        :error_area})
    },

    //开关选择是否为默认地址
    address_default({ detail }){
        this.setData({ address_default: detail });
    },

    //核对收件人姓名
    check_name(){
        let that = this
        let value_name = that.data.value_name
        let error_name = ''
        if(value_name == ''){
            error_name = '收件人姓名不能为空'
        }
        that.setData({error_name:error_name})
        
    },

    //核对收件人手机号
    check_number(){
        let that = this
        let value_number = that.data.value_number
        let error_number = ''
        if(value_number == ''){
            error_number = '收件人手机号不能为空'
        }else if(value_number.substr(0,3) != '010'){
            error_number = '请输入韩国手机号'
        }
        that.setData({error_number:error_number})
    },

    //核对收件人地址详情
    check_address(){
        let that = this
        let value_address = that.data.value_address
        let error_address = ''
        if(value_address == ''){
            error_address = '收件人地址详情不能为空'
        }

        that.setData({error_address:error_address})
    },


    //提交前核对信息
    check_address:function(){
        var that = this
        let value_name = that.data.value_name
        let value_number = that.data.value_number
        let value_address = that.data.value_address
        let area = that.data.area
        let check_name = true
        let check_number = true
        let check_address= true
        let check_area = true
        let error_name = ''
        let error_number = ''
        let error_address = ''
        let error_area = ''
        if(value_name == ''){
            error_name = '收件人姓名不能为空'
            check_name = false

        }else if(value_number == ''){
            error_number = '收件人电话不能为空'
            check_number = false

        } else if(area == 0){
            error_area = '请选择收货地址'
            check_area = false
             
        }else if(value_address == ''){
            error_address = '地址详情不能为空'
            check_address = false 
        }else if(value_number.substr(0,3) != '010' ){
            error_number = '请输入韩国手机号码'
            check_number = false
        }
        that.setData({error_name:error_name,error_number:error_number,error_area:error_area,error_address:error_address})
        if(check_name == false || check_number == false || check_area == false || check_address == false){
            return false
        }else{
            return true
        }
        

    },

    //点击提交地址信息
    formSubmit(e) {
        var that = this
        var Token = wx.getStorageSync('Token')
        var select_title = that.data.select_title
        var area = that.data.area
        var data = e.detail.value
        data.consignee_address = select_title + data.consignee_address
        data['Token']=Token
        data['consignee_area']=area
        var submit_status = that.data.submit_status
        if(submit_status == 1){
            var url = app.globalData.URL+'/user/wx_address_change/'
            data['consignee_id'] = that.data.consignee_id
        }else{
            var url = app.globalData.URL+'/user/wx_address_new/'
        }
        var check_address = that.check_address()
        if(check_address == true){
            Notify({ type: 'success', message: '地址信息正确' });
            that.submit(url,data)
        }else{
            Notify({ type: 'danger', message: '请核对收货信息' })
        }

         
    },
    // 提交修改内容，修改成功后返回上一页
    submit:function (url,data) {
        var csrftoken = wx.getStorageSync('csrftoken')
        var csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
        wx.request({
            url: url,
            method:"POST",
            dataType:JSON,
            header:{
              'content-type': 'application/x-www-form-urlencoded', // 默认值
              'cookie':csrf_token_cookie,
              "x-csrftoken":csrftoken
            },
            data:data,
            success:function (e) {
                wx.navigateBack()
            }
      })

    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        const eventChannel = that.getOpenerEventChannel()
        eventChannel.on('acceptDataFromOpenerPage', function(data) {
            var submit_status = data.submit_status
            var consignee_id = data.consignee_id
            that.setData({'submit_status':submit_status,'consignee_id':consignee_id})
            if(consignee_id != 0){
                that.get_address(consignee_id)
            }
            
          })

    },

    //获取地址信息方法
    get_address:function(consignee_id) {
        var that = this;
        var csrftoken = wx.getStorageSync('csrftoken')
        var csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
        var Token = wx.getStorageSync('Token')
        wx.request({
          url: app.globalData.URL+'/user/wx_get_address/',
          method:"POST",
          dataType:JSON,
          header:{
            'content-type': 'application/x-www-form-urlencoded', // 默认值
            'cookie':csrf_token_cookie,
            "x-csrftoken":csrftoken
          },
          data:{'Token':Token,'consignee_id':consignee_id},
          success:function (e) {
            let data = JSON.parse(e.data)
            let consignee_name = data.consignee_name
            let consignee_number = data.consignee_number
            that.setData({'value_name':consignee_name,'value_number':consignee_number})
            
          }
        })
      },
  

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        Toast.clear()

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})