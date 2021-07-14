const app = getApp()
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
Page({
    data: {
      //搜索框是否聚焦
      focus:false,

      // 左侧优先显示界面
      goods_category:0,

      // 左侧导航栏
      items:[
        {text: '休闲零食',},{text:'方便速食'},{text: '畅爽饮料',},{text: '粮油调料',},{text: '生活用品',},{text: '火锅专区',},{text:'下午茶'},{text:'水果生鲜'},{text:'熟食面点'}
      ],
      // 商品信息
      goods_dic_list:[],

      // 优惠商品
      goods_preferential:[],

      // 商品库存信息
      goods_commodity:[],

      // 加载次数
      times:0,

      // 最大加载次数
      max_times:Number,

      //即将加入购物车的商品ID
      cart_add_id:Number,


    },

    dialog_close(){
      this.setData({dialog_show:false})
    },

    //跳转至商品查询界面
    toSearch(){
      let that = this
      that.setData({focus:false})
      wx.navigateTo({
        url: '../search/search?focus=true',
      })
    },

    //跳转至商品详情页面
    // to_goods_detail:function(event){
    //   console.log(event)
    //   let dataset = event.currentTarget.dataset
    //   let goods_id = dataset.goods_id
    //   wx.navigateTo({
    //     url:'../goods_details/goods_details?goods_id='+goods_id,
    //   })
    // },
    
    onLoad:function(option){
      let that = this
      let goods_category = option.goods_category

      if(app.isEmptyObject(option)){
        goods_category = 0
      }

      that.setData({goods_category:goods_category})
      let times = that.data.times

      // 调用函数
      // 获取商品信息
      this.get_goods_dic(times,goods_category)  
    },
    
    onShow: function () {
      this.getTabBar().init();
    },

    onReady() {
      
    },

    //分享
    onShareAppMessage: function (res) {
      let Token = wx.getStorageSync('Token')
      return{
        title: '亲故玛特',
        path: '/pages/index/index?user_referrer='+Token
      }
    },

    //触底刷新
    onReachBottom:function(){
      var max_times = this.data.max_times
      var times  = this.data.times
      if(times <= max_times){
        this.get_goods_dic(this.data.times,this.data.goods_category)
      }else{
        Toast({message:'已到底',
        duration:2000
      });

      }
    },

    //点击左侧导航栏
    onClickNav:function(e){
      var that = this
      var detail = e.detail
      var index = detail.index
      var goods_category = Number
      if( index == 5){
        goods_category = 9
      }else if( index == 6){
        goods_category = 10
      }else if(index == 7){
        goods_category = 11
      }else if(index == 8){
        goods_category = 12
      }else{
        goods_category = index
      }
      var times = 0
      that.setData({goods_dic_list:[],times:times,goods_category:goods_category})
      that.get_goods_dic(times,goods_category)
    },
    
    //点击添加购物车
    add_cart(e){
      var goods_id = e.target.id
      let that = this
      that.cart_add(goods_id)
    },

    //获取商品信息
    get_goods_dic:function(times,goods_category){
      wx.showLoading({
        title: '加载中',
      })
      
      var that = this
      var goods_dic_list_last = that.data.goods_dic_list
        wx.request({
          url: app.globalData.URL+'/goods/product_list/',
          method:'GET',
          dataType:JSON,
          header:{
            'content-type': 'application/json', // 默认值
          },
          data:{'time':times,'goods_category':goods_category},
          success:function(res){
            var data =  JSON.parse(res.data)
            var goods_dic_list = data.goods_dic_list
            var max_times = Math.ceil(data.goods_count/10) 
            times = times+1
            goods_dic_list = goods_dic_list_last.concat(goods_dic_list)
            that.setData({max_times:max_times,goods_dic_list:goods_dic_list,times:times})
            wx.hideLoading()
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
          that.getTabBar().cart_number_change();
          
        },
        fail:function(){
          Toast.fail('加入失败')
        }
      })
    }
  });