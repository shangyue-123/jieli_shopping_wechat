// pages/integral_show/integral_show.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        image_src:app.globalData.URL+'/static/img/icons/积分显示.svg',

        integral_list:[],

        integral_number:Number,

    },

    intgral_show:function(){
        var that = this
        let csrftoken = wx.getStorageSync('csrftoken')
        let csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
        let Token = wx.getStorageSync('Token')

        wx.request({
            url: app.globalData.URL+'/discounts/integral_show/',
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
                let integral_list  = data.integral_list
                let integral_number = data.integral_number
                integral_list.map(function(integral_dic){
                    // console.log(integral_dic)
                    let date = new Date(integral_dic.date).toLocaleString('korea', { hour12: false })
                    integral_dic.date = date
                    let change_reason = integral_dic.change_reason
                    let change = integral_dic.change
                    if(change > 0 ){
                        integral_dic.change = '+' + change
                    }
                    let change_reason_text=''
                    switch(change_reason){
                        case 0:
                            change_reason_text = '推荐新用户'
                            break;
                        case 1:
                            change_reason_text = '推荐用户消费'
                            break;
                        case 2:
                            change_reason_text = '购买商品获取'
                            break;
                        case 3:
                            change_reason_text = '活动获取'
                            break;
                        case 4:
                            change_reason_text = '新用户注册'
                        case 5:
                            change_reason_text = '签到获取'
                            break;
                        case 6:
                            change_reason_text = '购买商品消费'
                            break;
                        case 7:
                            change_reason_text = '退换货扣除积分'
                            break;

                    }
                    integral_dic.change_reason_text = change_reason_text
                    that.setData({integral_list:integral_list,integral_number:integral_number})    
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this
        that.intgral_show();


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
    onShareAppMessage: function (res) {
        let Token = wx.getStorageSync('Token')
        return{
          title: '亲故玛特',
          path: '/pages/index/index?user_referrer='+Token
        }
      },
})