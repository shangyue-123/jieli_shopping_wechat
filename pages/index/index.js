const app = getApp()
const updateManager = wx.getUpdateManager()
import toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
updateManager.onCheckForUpdate(function (res) {
  // 请求完新版本信息的回调
  console.log(res.hasUpdate)
}),

updateManager.onUpdateReady(function () {
  wx.showModal({
    title: '更新提示',
    content: '新版本已经准备好，是否重启应用？',
    success: function (res) {
      if (res.confirm) {
        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
        updateManager.applyUpdate()
      }
    }
  })
})

updateManager.onUpdateFailed(function () {
  // 新版本下载失败
})

Page({
    data:{
        //弹出层显示
        // show:true,

        //搜索栏聚焦
        focus:false,

        //轮播图测试
        bananer_value:"测试",

        //倒计时
        time: 0,
        timeData:{},

        //轮播图
        indicatorDots:true,
        autoplay:true,
        interval:2000,
        duration:500,
        background:[app.globalData.URL+'/static/img/banner/暑期优惠.jpg',
                    // app.globalData.URL+'/static/img/banner/banner_2.jpg',
                    // app.globalData.URL+'/static/img/banner/banner_3.jpg',
                  ],

        // 商品图标列表（图片名和路径名称一致）
        image_icon:[
          {url:app.globalData.URL+'/static/img/icons/食品.svg',text:'休闲零食',goods_category:0},
          {url:app.globalData.URL+'/static/img/icons/速食食品.svg',text:'方便速食',goods_category:1},
          {url:app.globalData.URL+'/static/img/icons/饮料.svg',text:'畅爽饮料',goods_category:2},
          {url:app.globalData.URL+'/static/img/icons/调料.svg',text:'粮油调料',goods_category:3},
          {url:app.globalData.URL+'/static/img/icons/生活用品.svg',text:'生活用品',goods_category:4},
          {url:app.globalData.URL+'/static/img/icons/火锅.svg',text:'火锅专区',goods_category:9},
          {url:app.globalData.URL+'/static/img/icons/下午茶.svg',text:'下午茶',goods_category:10},
          {url:app.globalData.URL+'/static/img/icons/水果生鲜.svg',text:'水果生鲜',goods_category:11},
          {url:app.globalData.URL+'/static/img/icons/熟食面点.svg',text:'熟食面点',goods_category:12},
          
        ],
        text_icon:app.globalData.goods_categories,

        //从后端获取特惠商品信息
        goods_dic_list:[],

        //购物车图标
        // cart_image:'/static/img/icons/购物车.svg'

        
    },

    
    

    // 点击搜索跳转搜索页面
    toSearch(){
      let that = this
      that.setData({focus:false})
      wx.navigateTo({
        url: '../search/search?focus=true',
      })
    },


    //点击第一张轮播图
    banner_0(){
      wx.reLaunch({
        url: '../goods/goods'
      })
    },
    
    //点击商品类别跳转商品页面
    toGoods(e){
      let goods_category = e.target.dataset.goods_category
      wx.reLaunch({
        url: '../goods/goods?goods_category='+goods_category
      })
    },
    

    // 倒计时
    time_onChange(e){
      this.setData({
          timeData:e.detail,
          
      })
    },
    // 倒计时结束
    time_finish(){
      this.get_time()   
    },

    // 点击加入购物车
    add_cart(e){
      var goods_id = e.target.id
      this.cart_add(goods_id)
    },


    

    onShow: function (options) {
      // 获取商品信息
      this.goods_preferential()
      this.getTabBar().init();
      
      
    },

    onLoad:function(options){
      

      // 获取倒计时时间
      this.get_time()   

      // if(app.isEmptyObject(user_referrer) == false){
      //   //储存推荐人ID
      //   this.get_user_referrer(user_referrer)
      // }

      
      
    },
    // 分享小程序
    onShareAppMessage: function (res) {
      let Token = wx.getStorageSync('Token')
      return{
        title: '亲故玛特',
        path: '/pages/index/index?user_referrer='+Token
      }
    },
    
    // 获取服务器时间
    get_time:function(){
      var that = this
      wx.request({
        url: app.globalData.URL+'/',
        method:"GET",
        header:{'content-type': 'application/json'},
        success:function(res){
          
          // 获取服务器时间
          var server_date = res.header['Date']

          //转换为日期格式
          var date = new Date(server_date)
          //将服务器转换为毫秒数
          var date_milliseconds = Date.parse(date)

          var get_time = new Date(server_date)
          var get_year = get_time.getFullYear()
          var get_month = get_time.getMonth()+1
          var get_day = get_time.getDate()
          
          // 获取第二天的时间
          var next_date = new Date(get_year,get_month,get_day,23,59,59,999)
          // 将第二天0时转换为毫秒数
          var next_date_milliseconds = Date.parse(next_date)

          var time = next_date_milliseconds-date_milliseconds

          that.setData({time:time})

        }
      })

    },

    //获取商品特价
    goods_preferential:function(){
      wx.showLoading({
        title: '加载中',
      })
      var that = this;
      var csrftoken = wx.getStorageSync('csrftoken')
      var csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
      wx.request({
        url: app.globalData.URL+'/goods/product_list/',
        method:"POST",
        dataType:JSON,
        header:{
          'content-type': 'application/x-www-form-urlencoded', // 默认值
          'cookie':csrf_token_cookie,
          "x-csrftoken":csrftoken
        },
        success:function(res){
          if(res.statusCode == 403){
            this.goods_preferential()
          }else{
            var data = JSON.parse(res.data)
            that.setData({goods_dic_list:data})
          }
          wx.hideLoading()
        }

      })
    },

    //加入购物车，并改变购物车徽章数量
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
          Toast.success('已加入购物车');
          that.getTabBar().cart_number_change();
        },
        fail:function(){
          Toast.fail('加入失败')
        }
      })


    },
    //储存推荐人id
    // get_user_referrer:function(user_referrer){
    //   let Token = wx.getStorageSync('Token')
    //   wx.request({
    //     url: app.globalData.URL+'/user/wx_get_user_referrer/',
    //     method:'GET',
    //     dataType:JSON,
    //     header:{
    //       'content-type': 'application/json' // 默认值
    //       },
    //     data:{
    //       'user_referrer':user_referrer,
    //       'Token':Token
    //     },
    //     success:function(res){
    //       console.log(res)
    //     }
    //   })
      

    // }
 
})