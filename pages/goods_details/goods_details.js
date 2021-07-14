// pages/goods_details/goods_details.js
const app = getApp()
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
Page({

    /**
     * 页面的初始数据
     */
    data: {

        //轮播图
        indicatorDots:true,
        autoplay:true,
        interval:2000,
        duration:500,
        goods_detail_image:[],

    active: 0,

    // 商品详情
    goods_detail_dic:{},

    // 商品信息
    goods_dic:{},

    //是否弹出授权登陆框
    dialog_show:false,

    //即将加入购物车的商品ID
    cart_add_id:Number
    },

    //获取商品信息
    get_goods_detail:function(goods_id){
        var that = this
          wx.request({
            url: app.globalData.URL+'/goods/goods_detail/',
            method:'GET',
            dataType:JSON,
            header:{
              'content-type': 'application/json', // 默认值
            },
            data:{'goods_id':goods_id},
            success:function(res){
              let data =  JSON.parse(res.data)
              let goods_detail_dic = data.goods_detail_dic
              let goods_dic = data.goods_dic
              let goods_detail_image = data.goods_detail_image
              that.setData({goods_detail_dic:goods_detail_dic,
                goods_dic:goods_dic,goods_detail_image:goods_detail_image},)

            },
          })
        },


    //添加购物车
    cart_add:function(goods_id){
      Toast.loading({
        message: '提交中...',
        forbidClick: true,
      });
      var csrftoken = wx.getStorageSync('csrftoken')
      var csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
      var Token = wx.getStorageSync('Token')
      var that = this
      wx.request({
        url: app.globalData.URL+'/cart/cart_change/',
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
          'cart_number':1,
          'cart_type':'add',
        },
        success:function(){
          Toast.success({message:'已加入购物车',
          duration:800});
        },
        fail:function(){
          Toast.fail('加入失败')
        }
      })


    },


    //点击添加购物车,验证是否登录，如果登录直接加入购物车，未登录，向客户请求获取权限
    add_cart(e){
      var goods_id = e.target.id
      let that = this
      wx.getSetting({
        success (res){
          if (res.authSetting['scope.userInfo']) {
            that.cart_add(goods_id)
          }else{
            that.setData({dialog_show:true,cart_add_id:goods_id})
          }
        }
      }) 
      
    },

    //点击授权后，获取用户Token,并将商品传入购物车,更改
    bindGetUserInfo (e) {
      let goods_id = this.data.cart_add_id
      app.login_get(app.URL)
      this.cart_add(goods_id)
    },


    onChange(event) {
        wx.showToast({
          title: `切换到标签 ${event.detail.name}`,
          icon: 'none',
        });
      },



    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let goods_id = options.goods_id
        this.get_goods_detail(75)

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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})