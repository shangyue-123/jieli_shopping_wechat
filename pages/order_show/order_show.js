// pages/order_show/order_show.js
const app = getApp()
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        //分页查询次数
        time:0,

        //分页查询最大页数
        max_time:Number,

        //显示订单类型
        order_status:Number,

        //订单数组
        order_dic_arr:[],

        //客户端IP地址
        ip:String,


    },

    //点击右侧按钮
    button_right(e){

        var that = this
        let order_status = e.target.dataset.order_status
        let order_id = e.target.dataset.order_id
        let order_index = e.target.dataset.order_index
        let order_dic_arr = that.data.order_dic_arr
        let payment_amount = order_dic_arr[order_index].payment_amount
        switch(order_status){
            case 0:
                that.payCloud(order_id,payment_amount)
                break;

            case 1:
                order_status = order_status;
                that.address_change(order_id)
                that.order_status_change(order_status,order_id)
                break;

            case 2:
                order_status = 3;
                that.order_status_change(order_status,order_id)
                break;

            case 3:
                order_status = 4;
                that.order_status_change(order_status,order_id)
                break;

            case 4:
                order_status = 9;
                that.order_status_change(order_status,order_id)
                break;
            
            case 5:
                order_status = 10;
                that.order_status_change(order_status,order_id)
                break;
             
        }
        

        
    },

    //点击左侧按钮
    button_left(e){
        var that = this
        let order_status = e.target.dataset.order_status
        let order_id = e.target.dataset.order_id
        switch(order_status){
            case 0:
            case 1:
              Dialog.confirm({
                message: '确定取消订单吗',
                theme: 'round-button',
              })
              .then(() => {
                // on confirm
                order_status = 6; 
                that.order_status_change(order_status,order_id)
              })
              .catch(() => {
                // on cancel
                order_status = order_status; 
                that.order_status_change(order_status,order_id)
              });
              break; 
        }
        

    },

    // 点击取消订单时弹出提示框
    dialog_show:function(){
      

    },



    //点击左侧按钮

    //显示订单列表
    order_show:function(order_status,time){
        // Toast.loading({
        //     message: '加载中...',
        //     forbidClick: true,
        //     duration:500,
        //   });

        var that = this
        let csrftoken = wx.getStorageSync('csrftoken')
        let csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
        let Token = wx.getStorageSync('Token')

        wx.request({
            url: app.globalData.URL+'/order/wx_order_show/',
            method:"POST",
            dataType:JSON,
            header:{
            'content-type': 'application/x-www-form-urlencoded', // 默认值
            'cookie':csrf_token_cookie,
            "x-csrftoken":csrftoken
            },
            data:{
              'Token':Token,
              'order_status':order_status,
              'time':time,
            },
            success:function(res){
                let data = JSON.parse(res.data)
                let order_dic_count = data.order_dic_count
                let order_dic_arr = data.order_dic_arr
                let order_dic_arr_last = that.data.order_dic_arr
                let button_left = ''
                let button_right = ''
                let order_status_text = ''
                let button_right_show = ''
                let button_left_show = ''
                for(let i in order_dic_arr){
                    let order_status = order_dic_arr[i].order_status
                    switch(order_status){
                        case 0:
                            order_status_text = '待支付';

                            button_left = '取消订单';

                            button_right = '支付';

                            button_right_show = 'inline-flex'

                            button_left_show = 'inline-flex'

                            break;
                        case 1:
                            order_status_text = '待发货';

                            button_right = '更改地址';

                            button_left = '取消订单'

                            button_right_show = 'inline-flex'

                            button_left_show = 'inline-flex'

                            break;
                        case 2:
                            order_status_text = '待收货';

                            button_right = '确认收货';

                            button_right_show = 'inline-flex'

                            button_left_show = 'none'

                            break;
                        case 3:
                            order_status_text = '已收货';
                            
                            button_right_show = 'none'

                            button_left_show = 'none'
                            break;
                        
                        case 6:
                            order_status_text = '订单取消中';

                            button_right_show = 'none'

                            button_left_show = 'none'

                            break;
                        case 7:
                            order_status_text = '订单已取消';
                            break;

                    }
                    order_dic_arr[i].order_status_text = order_status_text
                    order_dic_arr[i].button_left = button_left
                    order_dic_arr[i].button_right = button_right
                    order_dic_arr[i].button_right_show = button_right_show
                    order_dic_arr[i].button_left_show = button_left_show
                }  
                let max_time = order_dic_count/5
                time++
                order_dic_arr = order_dic_arr_last.concat(order_dic_arr)
                Toast.clear()
                that.setData({max_time:max_time,order_dic_arr:order_dic_arr,
                   time:time
                })
            }
        })
    },

    //向服务器请求更改订单状态
    order_status_change:function(order_status,order_id){
        Toast.loading({
            message: '提交中...',
            forbidClick: true,
            // duration:500,
          });
        let that = this
        let csrftoken = wx.getStorageSync('csrftoken')
        let csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
        wx.request({
            url: app.globalData.URL+'/order/order_status_change/',
            method:"POST",
            dataType:JSON,
            header:{
            'content-type': 'application/x-www-form-urlencoded', // 默认值
            'cookie':csrf_token_cookie,
            "x-csrftoken":csrftoken
            },
            data:{
                'order_status':order_status,
                'order_id':order_id,
            },
            success:function(e){
                that.setData({order_dic_arr:[]})
                let order_status = that.data.order_status
                let time = 0
                that.order_show(order_status,time) 
            }
        })

    },

    
    //更改地址
     address_change(order_id){
        wx.navigateTo({
            url: '../address_list/address_list',
            events:{
              acceptDataFromOpenedPage: function(data) {
                // console.log(data)
              },
            },
            success:function(res){
              res.eventChannel.emit('acceptDataFromOpenerPage',{
                'order_id':order_id,'order_address_change':true
            })
            }
            
          })

    },

    //后端获取用户IP
    ip_get:function(){ 
        let that =  this
        wx.request({
          url: app.globalData.URL+'/user/ip_get/',
          method:'GET',
          success:function(res){
            let ip = res.data
            that.setData({ip:ip})
            Toast.clear()
          }
          
        })
      },

    //调用云函数支付，支付成功后向后台发送请求
    payCloud:function(order_id,payment_amount){
        let csrftoken = wx.getStorageSync('csrftoken')
        let csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
        let Token = wx.getStorageSync('Token')
        let ip = this.data.ip
        let RMB  = Number(payment_amount)/168
      wx.cloud.callFunction({
        // 云函数名称
        name: 'wechat_pay',
        // 传给云函数的参数
        data: {
          order_id: order_id,
          total_fee: RMB.toFixed(2),
          ip:ip
        },
        success: res => {
          const payment = res.result.payment
          wx.requestPayment({ 
            ...payment,
            success (res) {
                Notify({ type: 'success', message: '支付成功' });
              //向后台发送订单信息
              wx.request({
                url: app.globalData.URL+'/order/order_status_change/',
                method:"POST",
                dataType:JSON,
                header:{
                'content-type': 'application/x-www-form-urlencoded', // 默认值
                'cookie':csrf_token_cookie,
                "x-csrftoken":csrftoken
                },
                data:{
                  'Token':Token,
                  'order_id':order_id,
                  'order_status':1
                },
                success:function(res){
                    Notify({ type: 'success', message: '订单修改成功' });
                },
                fail:function(){
                    Notify({ type: 'danger', message: '订单修改失败' });
                }
              })
              console.log('pay success', res)
            },
            fail (res) {
              console.error('pay fail', res)
            }
          })
        },
        fail: console.error
      })
    },


    
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
        var that = this
        let order_status = options.order_status
        that.ip_get()
        if(app.isEmptyObject(options)){
            order_status = -1
        }
        let time = that.data.time
        that.setData({'order_status':order_status})
        that.order_show(order_status,time)
        Toast.clear()

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
        var that = this
        let order_status = that.data.order_status
        let time = that.data.time
        let max_time = that.data.max_time
        if(time <= max_time){
            that.order_show(order_status,time)
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})