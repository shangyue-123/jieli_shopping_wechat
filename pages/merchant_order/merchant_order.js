// pages/merchant_order/merchant_order.js
const app = getApp()
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        order_status_list: [
            { text: '全部订单', value: '-1' },
            { text: '待支付订单', value: 0 },
            { text: '待发货订单', value: 1 },
            { text: '待收货订单', value: 2 },
            { text: '已收货订单', value: 3 },
            { text: '换货订单', value: 4 },
            { text: '退货订单', value: 5 },
            { text: '待取消订单', value: 6 },
            { text: '已取消订单', value: 7 },
        ],

        expected_time: [
            { text: '今天下午三点收货', value: 0 },
            { text: '今天下午六点收货', value: 1 },
            { text: '明天下午三点收货', value: 2 },
            { text: '明天下午六点收货', value: 3 },
          ],


        //搜索的订单类型
        order_status: 1,

        //搜索订单的次数
        times:0,

        //搜索的最大次数
        max_times:0,

        //默认期望收货时间
        expected_time_value:0,

        //打开的卡片
        activeNames: [],

        //订单列表
        order_list:[],

        currentName:Number,

        icon:app.globalData.URL+'/static/img/icons/打电话.svg',

        next_page_show:''

    },

    //选择订单类型
    order_status_select(e){
        var that = this
        let order_status = e.detail
        that.setData({order_list:[],order_status:order_status})
        that.get_order(order_status,0)

    },

    //打开卡片后修改order_look,并删除标签
    order_look_change(e){
        let that = this  
        let index = e.detail
        let order_list = that.data.order_list
        let order_look = order_list[index].order_look
        let order_id = order_list[index].id
        if(order_look == false){
            wx.request({
                url: app.globalData.URL+'/order_manage/wx_order_manage/',
                method:'GET',
                dataType:JSON,
                header:{
                  'content-type': 'application/x-www-form-urlencoded' // 默认值
                  },
                data:{
                    'order_id':order_id
                },
                success:function(res){
                    order_look = true
                    order_list[index].order_tag = ''
                    that.setData({order_list:order_list})
                }
              })

        }
        
        
        

    },
    //打开关闭卡片
    onChange(event) {    
        this.setData({
          activeNames: event.detail,
        });
    },

    //点击右侧按钮
    button_right(e){
        var that = this
        let order_status = e.target.dataset.order_status
        let order_id = e.target.dataset.order_id
        switch(order_status){
            case 0:
                order_status = 1;
                that.order_status_submit(order_status,order_id)
                break;

            case 1:
                order_status = 2;
                that.order_status_submit(order_status,order_id)
                break;

            case 2:
                order_status = 3;
                that.order_status_submit(order_status,order_id)
                break;

            case 3:
                order_status = 4;
                that.order_status_submit(order_status,order_id)
                break;

            case 4:
                order_status = 9;
                that.order_status_submit(order_status,order_id)
                break;
            
            case 5:
                order_status = 10;
                that.order_status_submit(order_status,order_id)
                break;
            case 6:
                // order_status = 7;
                that.order_cancellation(order_id)

                break;
             
        }
        

        
    },

    //点击左侧按钮
    button_left(e){
        console.log(e)
        var that = this
        let order_status = e.target.dataset.order_status
        let order_id = e.target.dataset.order_id
        switch(order_status){
            case 0:
            case 1:
                order_status = 6;
                that.order_status_submit(order_status,order_id)
                break;

            // case 2:
            //     order_status = 3;
            //     break;

            case 3:
                order_status = 5;
                that.order_status_submit(order_status,order_id)
                break;

            case 4:
                order_status = 11;
                that.order_status_submit(order_status,order_id)
                break;
            
            case 5:
                order_status = 12;
                that.order_status_submit(order_status,order_id)
                break;
        }
        

    },

    //点击电话图标，拨打电话
    call_phone(e){
        let data = e.target.dataset
        let consignee_number = data.consignee_number
        wx.makePhoneCall({
          phoneNumber: consignee_number,
        })
    },


   

    //获取订单
    get_order:function(order_status,times){
        var that = this
        let csrftoken = wx.getStorageSync('csrftoken')
        let csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
        let Token = wx.getStorageSync('Token')
        let next_page_show = ''
        that.setData({next_page_show:next_page_show})

        wx.request({
            url: app.globalData.URL+'/order_manage/wx_order_manage/',
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
              'times':times
            },
            success:function(res){
                let data = JSON.parse(res.data)
                let times_dic = data.times_dic
                let max_times = times_dic.max_times
                let times  = times_dic.times + 1
                let order_list_last = that.data.order_list
                let order_list  = data.order_dic_list
                order_list = that.goods_information(order_list)
                order_list = order_list_last.concat(order_list)
                console.log(times,max_times)
                if(times == max_times){
                    next_page_show = 'none'
                    that.setData({next_page_show:next_page_show})
                }
                that.setData({order_list:order_list,max_times:max_times,times:times})
            }
        })

    },

    //从order_list中提取出需要的信息
    goods_information:function(order_list){
        var that = this
        for(let i in order_list){
            // let goods_json = order_list[i].goods_json
            // let goods_arr = []
            let order_look = order_list[i].order_look
            let order_tag = ''


            //修改期望收货时间
            let expected_time = new Date(order_list[i].expected_time).toLocaleString('korea', { hour12: false })
            order_list[i].expected_time = expected_time

            //修改订单创建时间
            let date = new Date(order_list[i].order_time).toLocaleString('korea', { hour12: false })
            order_list[i].order_time = date

            //根据订单状态，转换为文字，并显示按钮功能
            that.order_status_change(order_list[i])

            //根据支付方式，显示文本
            that.payment_method_change(order_list[i])

            //如果order_look为false则为新订单
            
            if(order_look == false){
                order_tag = '新订单'
            }
            order_list[i].order_tag = order_tag
        
        }
        return order_list
        

    },
    //根据订单状态，转换为文字，并显示按钮功能
    order_status_change:function(order_dic){
        let order_status = order_dic.order_status
        let button_left = ''
        let button_right = ''
        let order_status_text = ''
        let button_right_show = ''
        let button_left_show = ''
        switch(order_status){
            case 0:
                order_status_text = '待支付';

                button_left = '取消订单';

                button_right = '确定支付';

                button_right_show = 'inline-flex'

                button_left_show = 'inline-flex'

                break;
            case 1:
                order_status_text = '待发货';

                button_right = '确认发货';

                button_left = '取消订单'

                button_right_show = 'inline-flex'

                button_left_show = 'inline-flex'

                break;
            case 2:
                order_status_text = '待收货';

                button_right = '客户已收货';

                button_left = ''

                button_right_show = 'inline-flex'

                button_left_show = 'none'

                break;
            case 3:
                order_status_text = '已收货';

                button_right = '换货';

                button_left = '退货'

                button_right_show = 'inline-flex'

                button_left_show = 'inline-flex'
            

                break;
            case 4:
                order_status_text = '换货';

                button_right = '完成换货';

                button_left = '取消换货';

                button_right_show = 'inline-flex'

                button_left_show = 'inline-flex'

                break;
            case 5:
                order_status_text = '退货';

                button_right = '完成退货';

                button_left = '取消退货';

                button_right_show = 'inline-flex'

                button_left_show = 'inline-flex'

                break;
            case 6:
                order_status_text = '订单取消中';

                button_right = '同意取消';

                button_left = '拒绝取消';

                button_right_show = 'inline-flex'

                button_left_show = 'inline-flex'

                break;
            case 7:
                order_status_text = '订单已取消';
                break;
            case 9:
                order_status_text = '完成换货';
                break;
            case 10:
                order_status_text = '完成退货';
                break;
            case 11:
                order_status_text = '取消换货';
                break;
            case 12:
                order_status_text = '取消退货';
                break;
        }
        order_dic.order_status_text = order_status_text
        order_dic.button_left = button_left
        order_dic.button_right = button_right
        order_dic.button_right_show = button_right_show
        order_dic.button_left_show = button_left_show
    },
    //根据支付方式，显示文本
    payment_method_change:function(order_dic){
        let payment_method= order_dic.payment_method
        let payment_method_text = ''
        switch(payment_method){
            case 0:
                payment_method_text = '现金支付'
                
                break;
            case 1:
                payment_method_text = '微信支付'
                break;
            case 2:
                payment_method_text = '支付宝支付'
                break;
        }
        order_dic.payment_method_text = payment_method_text
    },
    //向服务器请求更改订单状态
    order_status_submit:function(order_status,order_id){
        Toast.loading({
            message: '提交中...',
            forbidClick: true,
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
                that.setData({order_list:[]})
                let order_status = that.data.order_status
                that.get_order(order_status,0)
               
                
            }
        })

    },
    //取消订单
    order_cancellation(order_id){
        let csrftoken = wx.getStorageSync('csrftoken')
        let csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
        var that = this
        wx.request({
            url: app.globalData.URL+'/order/wx_order_cancellation/',
            method:"POST",
            dataType:JSON,
            header:{
            'content-type': 'application/x-www-form-urlencoded', // 默认值
            'cookie':csrf_token_cookie,
            "x-csrftoken":csrftoken
            },
            data:{
                'order_id':order_id,
            },
            success:function(e){
                Notify({type: 'success',
                message: '订单取消成功，请进入微信支付进行退款处理'});
                var order_status = 7;
                that.order_status_submit(order_status,order_id)
            }
        })
    },

    //点击继续加载按钮，刷新下一页
    next_page(){
        let that = this
        let max_times = that.data.max_times
        let times = that.data.times
        let order_status = that.data.order_status
        
        if(times <= max_times){
            that.get_order(order_status,times)
        }else{
            let next_page_show = 'none'
            that.setData({next_page_show:next_page_show})
        }


    },

    //同意取消订单后退款
    // pay_refund:function(order_id,total_fee){
    //     wx.cloud.callFunction({
    //         name:'pay_refund',
    //         date:{
    //             order_id:order_id,
    //             total_fee:total_fee,

    //         },
    //         success:function(res){
    //             console.log(res)
    //         }

    //     })
    // },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let order_status = this.data.order_status
        this.get_order(order_status,0)

    },



     //触底刷新订单
    // onReachBottom: function(){
    //     console.log('触底刷新')
    //     let that = this
    //     let max_times = that.data.max_times
    //     console.log(max_times)
    //     let times = that.data.times
    //     let order_status = that.data.order_status
    //     console.log(order_status)
    //     if(times <= max_times){
    //         that.get_order(order_status,times)
    //     }else{
    //         Toast({message:'已到底',
    //         duration:2000
    //         });
    //     }

    // },

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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})