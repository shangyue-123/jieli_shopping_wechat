// pages/user/user.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // canIUse: wx.canIUse('button.open-type.getUserInfo'),
        //头像网址
        avatarUrl:String,
        //用户昵称
        nickName:'请点击授权登录',

        //判断是否为商户
        isMerchant: Boolean,
        //是否显示商户按钮
        button_show:"hidden",
        //是否显示用户授权按钮，
        button_UserInfo:"visibility",

        // 订单信息
        order_manage:[
          {icon:app.globalData.URL+'/static/img/icons/支付.svg',
           link_type:'navigateTo',
           url:'../order_show/order_show?order_status=0',
           text:'待支付',
           badge:0
          },
          {icon:app.globalData.URL+'/static/img/icons/打包.svg',
           link_type:'navigateTo',
           url:'../order_show/order_show?order_status=1',
           text:'待发货',
           badge:0
          },
          {icon:app.globalData.URL+'/static/img/icons/发货.svg',
           link_type:'navigateTo',
           url:'../order_show/order_show?order_status=2',
           text:'待收货',
           badge:0
          },
          {icon:app.globalData.URL+'/static/img/icons/订单.svg',
           link_type:'navigateTo',
           url:'../order_show/order_show',
           text:'我的订单',
           badge:0
          },
        ],

        // 优惠信息
        discounts:[
          {icon:app.globalData.URL+'/static/img/icons/优惠券.svg',
           link_type:'navigateTo',
          //  url:app.globalData.URL+'/order/',
           text:'优惠券'
          },
          {icon:app.globalData.URL+'/static/img/icons/红包.svg',
          link_type:'navigateTo',
          // url:app.globalData.URL+'/order/',
          text:'红包'
         },
         {icon:app.globalData.URL+'/static/img/icons/积分.svg',
         link_type:'navigateTo',
         url:'/pages/integral_show/integral_show',
         text:'积分'
        },
        {icon:app.globalData.URL+'/static/img/icons/礼品卡.svg',
        link_type:'navigateTo',
        // url:app.globalData.URL+'/order/',
        text:'礼品卡'
        },
        ]

    },
    //点击授权获取用户信息
    getUserProfile (e) {
      let that = this
      wx.getUserProfile({
        desc: '用于显示头像和昵称', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          let userInfo = res.userInfo
          let nickName = userInfo.nickName 
          let avatarUrl = userInfo.avatarUrl
          that.setData({nickName:nickName,avatarUrl:avatarUrl,button_UserInfo:'hidden'})
        }
      })

      },

    toMerchant(events){
      wx.navigateTo({
        url: '../merchant_order/merchant_order',
        events: events,
        success: (result) => {},
        fail: (res) => {},
        complete: (res) => {},
      })

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      
      this.get_personal_information()
        

    },

    get_personal_information:function(){
      var that = this
      let csrftoken = wx.getStorageSync('csrftoken')
      let csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
      let Token = wx.getStorageSync('Token')
      var order_manage = that.data.order_manage
      wx.request({
        url: app.globalData.URL+'/user/wx_personal_information/',
        method:"POST",
        dataType:JSON,
        header:{
        'content-type': 'application/x-www-form-urlencoded', // 默认值
        'cookie':csrf_token_cookie,
        "x-csrftoken":csrftoken
        },
        data:{
          'Token':Token,
        },
        success:function(res){
          let data = JSON.parse(res.data)
          let data_key_arr = Object.keys(data)
          let data_value_arr = []
          let isMerchant = data.isMerchant
          let button_show = 'hidden'
          if(isMerchant == true){
            button_show = 'visibility'
          }
          data_key_arr.map(function(key){
            data_value_arr.push(data[key])
          })
          order_manage.map(function(dic,index){
            dic['badge'] = data_value_arr[index]
          })
          that.setData({'order_manage':order_manage,'isMerchant':isMerchant,'button_show':button_show})
        }
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
        this.getTabBar().init();
        this.get_personal_information()
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
})