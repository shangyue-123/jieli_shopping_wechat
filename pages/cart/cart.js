const { default: toast } = require("../../miniprogram_npm/@vant/weapp/toast/toast");
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
const app = getApp()
Page({
 
    /**
     * 页面的初始数据
     */
    data: {
        //是否显示空状态栏
        show_empty:'inline',

        //获取商品信息
        goods_dic_list:[],

        // 优惠商品
        goods_preferential:[],

        // // 加载次数
        // times:0,

        // // 最大加载次数
        // max_times:10,

        //多选数据name
        result:[],

        //单选
        all_change:false,

        //总价
        sum:0

    },


    //点击删除按钮，删除购物车信息，并改商品数据库信息为0

    delete(e){
      var that = this
      let dataset = e.target.dataset
      let goods_id = dataset.goods_id
      that.cart_change(goods_id,0)
    
    },


    //点击获取用户信息
    getUserProfile (e) {
      var that = this
      let csrftoken = wx.getStorageSync('csrftoken')
      let csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
      let Token = wx.getStorageSync('Token')
      wx.getUserProfile({
        desc: '用于获取用户昵称', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          let userInfo = res.userInfo
          let nickName = userInfo.nickName 
          wx.request({
            url: app.globalData.URL+'/user/wx_get_user_name/',
            method:"POST",
            dataType:JSON,
            header:{
              'content-type': 'application/x-www-form-urlencoded', 
              'cookie':csrf_token_cookie,
              "x-csrftoken":csrftoken
            },
            data:{
              'Token':Token,
              'user_name':nickName
            },
            success(res){
              console.log(res)
              that.get_goods_dic()
              that.setData({show_empty:'none'})

            }
            
          })
        }
      })
      // app.login_get(app.URL)
      
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {


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

      var that = this
      that.getTabBar().init();
      // this.get_goods_dic()
      wx.getSetting({
        success(res){
          if (res.authSetting['scope.userInfo']){
            that.setData({show_empty:'none'})
            app.user_name_update(app.globalData.URL)
            that.get_goods_dic()
          }
        }
      })
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
    onShareAppMessage: function (res) {
      let Token = wx.getStorageSync('Token')
      return{
        title: '亲故玛特',
        path: '/pages/index/index?user_referrer='+Token
      }
    },

    // 点击单选事件
    select_change(event) {
        this.setData({
          result: event.detail,
        });
        this.price_sum()
        
      },

    // 点击全选事件
    all_change(e){
      var that = this
      var goods_dic_list = that.data.goods_dic_list
      var goods_preferential = that.data.goods_preferential
      var state =  e.detail
      this.all_select(goods_dic_list,goods_preferential,state)
      this.price_sum()
    },

    //点击步进器，异步传输
    cart_goods_quantity_change(e){
      toast.loading({message:'修改中',
      duration:800

    })
      var goods_id = e.currentTarget.id
      var cart_goods_quantity = e.detail
      this.cart_change(goods_id,cart_goods_quantity)
    },

    // 提交订单
    order_submit(e){
      let that = this
      let result = that.data.result
      let len = result.length;
      if(len == 0){
        Notify({ type: 'danger', message: '请选择想要购买的商品' });
      }else{
        that.submit_order(result)
      }
    },

    //获取商品信息
    get_goods_dic:function(){
      wx.showLoading({
        title: '加载中',
      })
        var that = this
          wx.request({
            url: app.globalData.URL+'/cart/wx_cart_list/',
            method:'GET',
            dataType:JSON,
            header:{
              'content-type': 'application/json', // 默认值
            },
            data:{'Token':wx.getStorageSync('Token')},
            success:function(res){
              var data =  JSON.parse(res.data)
              var goods_dic_list = data.goods_dic_list
              var goods_preferential = data.goods_preferential
              that.setData({goods_dic_list:goods_dic_list,goods_preferential:goods_preferential})
              wx.hideLoading()

            },
          })
        },
  
    //异步更改步进器，和商品数量显示
    cart_change:function(goods_id,cart_goods_quantity){
      Toast.loading({
        message: '修改中...',
        forbidClick: true,
        duration:1000
      });
      var that = this
      var csrftoken = wx.getStorageSync('csrftoken')
      var csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
      var Token = wx.getStorageSync('Token')
      var goods_dic_list = that.data.goods_dic_list
      var goods_preferential = that.data.goods_preferential
      wx.request({
        url: app.globalData.URL+'/cart/wx_cart_change/',
        method:"POST",
        dataType:JSON,
        header:{
        'content-type': 'application/x-www-form-urlencoded', // 默认值
        'cookie':csrf_token_cookie,
        "x-csrftoken":csrftoken
        },
        data:{
          'Token':Token,
          'goods_id':goods_id,
          'cart_goods_quantity':cart_goods_quantity
        },
        success:function (res) {
          var cart_number = JSON.parse(res.data).cart_number
          var change = false
          for(var i in goods_preferential){
            if(goods_preferential[i].goods_id == goods_id){
              goods_preferential[i].cart_goods_quantity = cart_number
              if(cart_number == 0){
                goods_preferential[i].display = 'none'
              }
              that.setData({'goods_preferential':goods_preferential})
              change = true
              that.getTabBar().init();
              toast.success('修改成功')
              that.price_sum()
              break;
            }
          }
          for(var j in goods_dic_list){
            if(goods_dic_list[j].goods_id == goods_id){
              goods_dic_list[j].cart_goods_quantity = cart_number
              if(cart_number == 0){
                goods_dic_list[j].display = 'none'
              }
              that.setData({'goods_dic_list':goods_dic_list})
              change = true
              that.getTabBar().init();
              toast.success({
                message:'修改成功',
                forbidClick: true,
                duration:800,
            
            });
              that.price_sum()
              break;
            }
          }
          if(change == false){
            that.getTabBar().init();
            toast.fail({
              message:'修改失败',
              forbidClick: true,
              duration:800,
          
          });
          }
        }
      })
      
    },

    //点击全选按钮，实现全选
    all_select:function(goods_dic_list,goods_preferential,state){
      var that = this
      var result = []
      if(state == true){
        goods_preferential.map(function(currentValue){
          result.push(String(currentValue.goods_id) )
        });
        goods_dic_list.map(function(currentValue){
          result.push(String(currentValue.goods_id))
        });

      }
      that.setData({'result':result,'all_change':state})
    },

    // 计算总价
    price_sum:function(){
      var that = this
      var goods_dic_list = that.data.goods_dic_list
      var goods_preferential = that.data.goods_preferential
      var result = that.data.result
      var sum_arr = []
      var sum = 0

      for(var i in result){
        var goods_id = result[i]
        for(var j in goods_preferential){
          if(goods_preferential[j].goods_id == goods_id){
            var goods_preferential_price = parseFloat(goods_preferential[j].goods_preferential_price) 
            var cart_goods_quantity = parseInt(goods_preferential[j].cart_goods_quantity) 
            var price = goods_preferential_price * cart_goods_quantity
            sum_arr.push(price)
          }
        }
        for (var n in goods_dic_list){
          if(goods_dic_list[n].goods_id == goods_id){
            var goods_sell_price = parseFloat(goods_dic_list[n].goods_sell_price) 
            var cart_goods_quantity = parseInt(goods_dic_list[n].cart_goods_quantity)
            var price = goods_sell_price * cart_goods_quantity
            sum_arr.push(price)
          }
          }
        }
        sum_arr.map(function(price){
          sum +=price
        })
        that.setData({sum:sum*100})
        return sum

      },

    
    //提交信息并跳转传输数据
    submit_order:function(result){
      var that = this
      var csrftoken = wx.getStorageSync('csrftoken')
      var csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
      var Token = wx.getStorageSync('Token')
      var sum_price = that.data.sum/100
      var goods_dic_list = that.data.goods_dic_list
      var goods_preferential = that.data.goods_preferential
      var goods_message = []
      var goods_dic_list_pay = []
      var goods_preferential_pay = []

      //遍历获取勾选商品
      for(var i in goods_dic_list){
        result.map(function(goods_id){
          if(goods_id == goods_dic_list[i].goods_id){
            var goods_dic = goods_dic_list[i]
            goods_message.push(goods_dic)
            goods_dic_list_pay.push(goods_dic)
          }
        })
      }
      //遍历获取特价商品信息
      for(var j in goods_preferential){
        result.map(function(goods_id){
          if(goods_id == goods_preferential[j].goods_id){
            var goods_dic = goods_preferential[j]
            goods_message.push(goods_dic)
            goods_preferential_pay.push(goods_dic)
          }
        })
      }
      goods_message = JSON.stringify(goods_message)

      wx.request({
        url: app.globalData.URL+'/pay/wx_pay/',
        method:"POST",
        dataType:JSON,
        header:{
        'content-type': 'application/x-www-form-urlencoded', // 默认值
        'cookie':csrf_token_cookie,
        "x-csrftoken":csrftoken
        },
        data:{
          'Token':Token,
          'goods_message':goods_message,
          'sum_price':sum_price,
        },
        success:function(res){
          var data = JSON.parse(res.data)
          var order_id = data.order_id
          var consignee_name = data.consignee_name
          var consignee_number = data.consignee_number
          var consignee_address = data.consignee_address
          var integral_number = data.integral_number
          var freight = data.freight
          var payment_amount = data.payment_amount
          var order_time = data.order_time
          wx.navigateTo({
            url: '../pay/pay',
            events:{
              acceptDataFromOpenedPage: function(data) {
                // console.log(data)
              },
            },
            success:function(res){
              res.eventChannel.emit('acceptDataFromOpenerPage',{
                'goods_dic_list':goods_dic_list_pay,
                'goods_preferential':goods_preferential_pay,
                'order_id':order_id,
                'consignee_name':consignee_name,
                'consignee_number':consignee_number,
                'consignee_address':consignee_address,
                'integral_number':integral_number,
                'sum':sum_price,
                'freight':freight,
                'payment_amount':payment_amount
            })
            }
            
          })
        }
      })      
  },

   
})
