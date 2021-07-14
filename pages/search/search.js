// pages/search/search.js
const app = getApp()
import toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        //聚焦搜索框
        search_focus:false,

        //搜索框的内容
        search_input:"", 

        //商品信息
        goods_dic_list:[],

        //即将加入购物车的商品ID
        cart_add_id:Number,

        //是否弹出授权登陆框
        dialog_show:false,


    },
    // 搜索栏事件

    //搜索栏变化
    search_change(e){
        this.setData({
            search_input:e.detail,
        })
    },
    //点击搜索按钮
    search(){
        let search_input = this.data.search_input
        if(search_input != ''){
            this.get_goods_dic(search_input)
        }else{
            this.setData({
                goods_dic_list:[],
            })

        }
    },

    //点击加入购物车
    add_cart(e){
        var goods_id = e.target.id
        this.cart_add(goods_id)
    },

    
    //获取商品信息
    get_goods_dic:function(search_input){
    Toast.loading('搜索中...')
    var that = this
    wx.request({
        url: app.globalData.URL+'/goods/wx_goods_search/',
        method:'GET',
        dataType:JSON,
        header:{
        'content-type': 'application/json', // 默认值
        },
        data:{'search_input':search_input,},
        success:function(res){
        var data =  JSON.parse(res.data)
        that.setData({goods_dic_list:data})
        toast.clear()
            }
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
        Toast.success('已加入购物车');
        },
        fail:function(){
        Toast.fail('加入失败')
        }
    })


    },

    //搜索
    

    //点击去购物车结算
    toCart(){
        wx.switchTab({
            url: '../cart/cart',
        })
    },


    //点击添加购物车,验证是否登录，如果登录直接加入购物车，未登录，向客户请求获取权限
    add_cart(e){
        var goods_id = e.target.id
        let that = this
        that.cart_add(goods_id)
        },
      
   

    
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        setTimeout(function(){

            that.setData({search_focus:true}) 
        }, 500);
        
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