App({

  globalData:{
      URL:"https://jieli.store", 
      // URL:"http://150.109.234.161:8003",

  },


  
  isEmptyObject:function(obj){
    for (var key in obj) {
      return false;
    }
    return true;
 
  },
  login_get:function(URL) {
    wx.login({
      success(res){
        if(res.code){
          wx.request({
            url:URL+'/user/wx_login',
            method:"GET",
            data:{
              js_code:res.code,
            },
            success(res){
              if(res.statusCode == 403 | res.statusCode == 500 ){
                setTimeout(that.login_get(),5000)
                
            }else{
              wx.setStorageSync('Token', res.data) 
            }
            }
          })
        }
      }
    })

    
  },
  user_name_update:function(URL){
    wx.getUserInfo({
      success: function(res) { 
        let userInfo = res.userInfo
        let user_name = userInfo.nickName
        let csrftoken = wx.getStorageSync('csrftoken')
        let csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
        let Token = wx.getStorageSync('Token')
        wx.request({
          url: URL+'/user/wx_get_user_name/',
          method:"POST",
          dataType:JSON,
          header:{
            'content-type': 'application/x-www-form-urlencoded', 
            'cookie':csrf_token_cookie,
            "x-csrftoken":csrftoken
          },
          data:{
            'Token':Token,
            'user_name':user_name
          },
          
        })
      }
    })
  },


  getUserProfile:function(URL,desc) {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
      }
    })
  },




  

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function (options) {

    wx.cloud.init({

      traceUser: true,

    })


    let URL = this.globalData.URL
    this.login_get(URL)
    // csrf_token_get()
    // this.user_name_update()


    

    //获取后台csrf_token
    // function csrf_token_get(){
    //   // var that = this
    //   wx.request({
    //     url: URL+'/user/get_csrf/',
    //     method:'GET',
    //     dataType:JSON,
    //     header:{
    //       'content-type': 'application/json' // 默认值
    //       },
    //     success:function(res){
    //       console.log(res)
    //       var csrf_token_cookie = res.header['Set-Cookie'].split(';')[0]
    //       console.log(csrf_token_cookie)
    //       wx.setStorageSync('csrftoken', res.data) 
    //       wx.setStorageSync('csrf_token_cookie', csrf_token_cookie) 
    //     }
    //   })

    // }
  
    
    //更新用户名称
    function user_name_update(){
      
    }
    
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
   
    
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  },

  



  

})
