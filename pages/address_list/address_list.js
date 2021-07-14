// pages/address_change/address_change.js
const app = getApp()
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
Page({

    /**
     * 页面的初始数据
     */
    data: {

        //右侧图标
        address_icon:app.globalData.URL+'/static/img/icons/pencil-square.svg',

        //默认地址信息
        address_default:[],

        //地址信息
        address:[], 

        //支付界面跳转时，更改order_id
        order_id:0,

        //是否为订单地址修改
        order_address_change:false,

    },

    //点击修改图标修改地址信息
    address_change(e){
      // console.log(e)
      var consignee_id = e.target.id
      if(consignee_id == ''){
        consignee_id = 0
        var submit_status = 0
      }else{
        var submit_status = 1
      }
      wx.navigateTo({
        url: '../address_change/address_change',
        events:{
          acceptDataFromOpenedPage: function(data) {
            // console.log(data)
          },
        },
        success:function(res){
          res.eventChannel.emit('acceptDataFromOpenerPage',{
            'submit_status':submit_status,'consignee_id':consignee_id

        })
        }
        
      })
    },

    //点击新建地址按钮
    address_new(){
        wx.navigateTo({
            url: '../address_change/address_change',
            events:{
              acceptDataFromOpenedPage: function(data) {
              },
            },
            success:function(res){
              res.eventChannel.emit('acceptDataFromOpenerPage',{
                'submit_status':0,'consignee_id':0
            })
            }
            
          })
    },
    
    //获取地址信息方法
    get_address:function() {
      var that = this;
      var csrftoken = wx.getStorageSync('csrftoken')
      var csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
      var Token = wx.getStorageSync('Token')
      wx.request({
        url: app.globalData.URL+'/user/wx_address/',
        method:"POST",
        dataType:JSON,
        header:{
          'content-type': 'application/x-www-form-urlencoded', // 默认值
          'cookie':csrf_token_cookie,
          "x-csrftoken":csrftoken
        },
        data:{'Token':Token},
        success:function (e) {
          let data = JSON.parse(e.data)
          let address_default = data.consignee_dic_default_list
          let address = data.consignee_dic_list
          that.setData({'address_default':address_default,'address':address})
          
        }
      })
    },
    
    //点击地址，判断是否为订单修改，不是则跳转支付界面，并更改支付界面地址信息，是则后端修改地址信息
    address_select(e){
      let order_id = this.data.order_id

      if(order_id != 0){
        Dialog.confirm({
          message: '确定使用此地址吗？',
          theme: 'round-button',
        })
        // 点击确定
          .then(() => {
            let order_address_change = this.data.order_address_change
            let consignee_id = e.currentTarget.id
            let address_default_arr = this.data.address_default
            if(address_default_arr.length == 0){
              var address_default = {id:0}
            }else{
              var address_default = address_default_arr[0]
            }
            let address = this.data.address
            if(order_id != 0){
              if(address_default.id == consignee_id){
                var consignee_name  = address_default.consignee_name
                var consignee_number = address_default.consignee_number
                var consignee_address = address_default.consignee_address
                var consignee_area = address_default.consignee_area
              }else{
                for(let i in address){
                  if(consignee_id == address[i].id){
                    var consignee_name  = address[i].consignee_name
                    var consignee_number = address[i].consignee_number
                    var consignee_address = address[i].consignee_address
                    var consignee_area = address[i].consignee_area
                  }
                }
              }
            }
            
            if(order_address_change == true){
              let csrftoken = wx.getStorageSync('csrftoken')
              let csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
              wx.request({
                url: app.globalData.URL+'/order/wx_order_address_change/',
                method:"POST",
                dataType:JSON,
                header:{
                  'content-type': 'application/x-www-form-urlencoded', // 默认值
                  'cookie':csrf_token_cookie,
                  "x-csrftoken":csrftoken
                },
                data:{
                  'order_id':order_id,
                  'consignee_name': consignee_name,
                  'consignee_number': consignee_number,
                  'consignee_address': consignee_address,
                  'consignee_area':consignee_area,
                },
                success:function(res){
                  let data = JSON.parse(res.data) 
                  let carriage = data.carriage
                  let pages = getCurrentPages();
                  let prevPage = pages[pages.length - 2]; // 上一页
                  prevPage.setData({
                    'consignee_name': consignee_name,
                    'consignee_number': consignee_number,
                    'consignee_address': consignee_address,
                    'consignee_area':consignee_area,
                    'freight':carriage
                  })
                  wx.navigateBack({
                    delta:1
                  })   
                }
        
              })
              
      
            }
      
          })
          // 点击取消
          .catch(() => {
            Dialog.close()
          });
        
  

      }
    }, 

    //点击删除，删除地址信息
    delete(e){
      let that = this
      let dataset = e.target.dataset
      console.log(dataset)
      let consignee_id = dataset.consignee_id
      console.log(consignee_id)
      wx.request({
        url: app.globalData.URL+'/user/wx_address_delete/',
        method:'GET',
        dataType:JSON,
        header:{
          'content-type': 'application/x-www-form-urlencoded', // 默认值
        },
        data:{'consignee_id':consignee_id},
        success:function(res){
          that.get_address()

        }
      })
    },

    //点击图标跳转至信息修改界面

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      let that = this
      that.get_address()
      const eventChannel = that.getOpenerEventChannel()
      eventChannel.on('acceptDataFromOpenerPage', function(data) {
          let order_id = data.order_id
          let order_address_change = data.order_address_change
          if(typeof(order_address_change) == 'undefined'){
            order_address_change = false
          }else{
            order_address_change = true
          }
          that.setData({order_id:order_id,order_address_change:order_address_change})
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
      this.get_address()

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