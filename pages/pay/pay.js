// pages/pay/pay.js
const app = getApp()
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
Page({

    /**
     * 页面的初始数据
     */
    data: {

        //显示地址信息
        consignee_name:'',
        consignee_number:'',
        consignee_address:'',

         //获取商品信息
        goods_dic_list:[],

        // 优惠商品
        goods_preferential:[],

        //订单编号
        order_id:Number,

        //商品总价
        sum:Number,

        //运费
        freight:0,

        //活动优惠金额
        dicount_amount:'无活动',

        //积分
        integral_number:'',

        //最多可使用积分
        max_integral:Number,

        //使用积分
        use_integral_number:0,

        //积分可节省金额
        save_amount:0,

        //商品折扣优惠
        all_dicount_amount:0,

        //显示支付方式
        show: false,

        //显示积分
        show_popup_integral:false,

        //积分文字颜色
        text_color:'',

        //运费文字颜色
        freight_color:'',

        //活动优惠文字颜色
        dicount_amount_color:'',

        //显示积分选择框
        show_popup_integral:false,

        //优惠后商品总价
        sum_price:Number,

        expected_time_show:false,

        //显示弹框期望配送时间
        expected_time_select:[

          {
            name: '今日中午12点',
            value:0,
            subname: '',
            disabled: false
          },
          { name: '今日下午5点',
            value:1,
            subname: '',
            disabled: false
          },
          // { name: '今日晚上8点',
          //   value:2,
          //   subname: '',
          //   disabled: false
          // },
          { name: '次日中午12点',
            value:3,
          },
          { name: '次日下午5点',
            value:4,
          },
          // { name: '次日晚上8点',
          //   value:5,
          // },

          

        ],
        //传输给数据库时间格式
        expected_time:'',

        // 默认的时间
        expected_time_value:-1,

        // 对应的时间
        expected_time_name:'',
        
        //显示弹框支付方式
        payment_method_select: [
        {
          name: '韩币现金支付',
          value:0,
        },
        { name: '微信支付',
          value:1,
        },

        ],

        //支付方式
        payment_method:1,

        //支付方式对应的名称
        payment_name:'微信支付',

        //客户端IP地址
        // ip:String,

        //备注信息
        value_remark:'',

        //微信支付nonce_str
        // nonce_str:''

    },
    // 点击地址选择
    address_change(e){
        let order_id = this.data.order_id
        wx.navigateTo({
            url: '../address_list/address_list',
            events:{
              acceptDataFromOpenedPage: function(data) {
              },
            },
            success:function(res){
              res.eventChannel.emit('acceptDataFromOpenerPage',{
                'order_id':order_id,
                'order_address_change':true
            })
            }
            
          })

    },
    //点击显示积分栏
    show_popup_integral(){
      this.setData({show_popup_integral:true})
    },
    //使用积分数变化，改变节约金额
    calculate_amount(e){ 
      let use_integral_number = e.detail
      this.integral_change(use_integral_number)
      // this.total_price()
    },

    //点击遮罩层关闭弹框,点击关闭按钮关闭弹框
    click_overlay(){
      let use_integral_number = 0
      this.integral_change(use_integral_number)
      // this.total_price()
      this.setData({show_popup_integral:false,use_integral_number:0})
    },
    // 点击确定
    use_integral(){
      this.setData({show_popup_integral:false})
    },


    //点击关闭支付方式选择
    onClose() {
        this.setData({ show: false,expected_time_show:false });
      },

    
    //获取支付方式
    pay_method_select(event) {
      let that = this
      let payment_method = event.detail.value
      let payment_name = event.detail.name
      let order_id = that.data.order_id
      let data_change = {'payment_method':payment_method,'id':order_id}
      that.information_change(data_change)
      that.setData({payment_method:payment_method,payment_name:payment_name})
    },
    //点击弹出支付选择框
    pay_select(e){
        this.setData({ show: true });
    },

    //显示期望配送时间
    expected_time_show(){
      this.time_show()
      this.setData({expected_time_show:true})
    },
    //期望配送时间选择
    expected_time_select(event){
      let that = this
      let expected_time_value = event.detail.value
      let expected_time_name = event.detail.name
      that.expected_time_date(expected_time_value)
      
      that.setData({expected_time_value:expected_time_value,expected_time_name:expected_time_name,expected_time_show:false})

    },

    // 备注框失去焦点时上传备注信息
    submit_remark:function(){
      let that = this
      let value_remark = that.data.value_remark
      let order_id = that.data.order_id
      let data_change = {'order_remark':value_remark,'id':order_id}
      that.information_change(data_change)
    },


    //点击提交订单
    submit_order(){
      let check = this.check_message();
      let payment_method = this.data.payment_method
      let that = this

      if(check == true && payment_method ==  1){
        // this.payCloud()
        this.wx_pay()
      }else if(check == true && payment_method ==  0){
        let order_id = that.data.order_id
        let Token = wx.getStorageSync('Token')
        this.pay_confirm(order_id,Token,true)

      }
    },

    

    // 微信支付，向后端获取微信支付所需要的信息
    wx_pay:function(){
      var that = this;
      var csrftoken = wx.getStorageSync('csrftoken')
      var csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
      let order_id = that.data.order_id
      let Token = wx.getStorageSync('Token')
      wx.request({
        url: app.globalData.URL+'/pay/make_order/',
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
        },
        success(res){
          var data = JSON.parse(res.data)
          wx.requestPayment({
            nonceStr: data.nonceStr,
            package: data.package,
            paySign: data.paySign,
            timeStamp: data.timeStamp,
            signType:'MD5',
            success(res){
              console.log(res)
              that.pay_confirm(order_id,Token,true)
            },
            fail(res){
              that.pay_confirm(order_id,Token,false)
            }
          })

        }
      })
      

    },
    
    //支付成功向后台传输
    pay_confirm:function(order_id,Token,result){
      let that = this
      let csrftoken = wx.getStorageSync('csrftoken')
      let csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
      wx.request({
        url: app.globalData.URL+'/pay/pay_confirm/',
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
          'result':result
        },
        success(){
          that.subscribe_message(order_id,result)
        },
    })
  },

    //积分变化函数
    integral_change:function(use_integral_number){
      let that = this
      let save_amount = (use_integral_number*10).toFixed(2)
      let sum = that.data.sum
      let max_integral = that.data.max_integral
      let all_dicount_amount = that.data.all_dicount_amount
      let order_id = that.data.order_id
      let data_change = {'integral_number':use_integral_number,'id':order_id}
      
      if(use_integral_number == 0){
        
        that.setData({save_amount:save_amount,integral_number:'可用积分：'+max_integral,})
      }else if(use_integral_number !=0){
        if(save_amount > sum*0.1){
          data_change.integral_number = 0
          that.setData({save_amount:0,integral_number:'可用积分：'+max_integral,use_integral_number:0})
          Notify({ type: 'danger', message: '积分抵扣不能超过总价的10%' });
        }else if(all_dicount_amount != 0){
          data_change.integral_number = 0
          that.setData({save_amount:0,integral_number:'可用积分：'+max_integral,use_integral_number:0})
          Notify({ type: 'danger', message: '活动期间无法使用积分' });
        }else{
          that.setData({save_amount:save_amount,integral_number:'可节省：₩'+save_amount,use_integral_number:use_integral_number})
        }
      }
      that.information_change(data_change)
    },

    //计算优惠后总价
    total_price:function(){
      var that = this
      let sum = that.data.sum
      //运费
      let freight = that.data.freight

      //积分优惠金额
      let save_amount = that.data.save_amount
     
      //活动优惠金额
      let all_dicount_amount = that.data.all_dicount_amount
    


      let sum_price = sum+freight-save_amount-all_dicount_amount

      that.setData({sum_price:sum_price})

    },

    //提交订单前核对信息
    check_message:function(){
      let that = this
      let consignee_name = that.data.consignee_name
      let consignee_number = that.data.consignee_number
      let consignee_address = that.data.consignee_address
      let expected_time_value = that.data.expected_time_value
      let expected_time_name = that.data.expected_time_name

      if(consignee_name == ''|| consignee_number == '' || consignee_address == '' ){
        Notify({ type: 'danger', message: '请完善收件信息' });
        return false
      }
      if(expected_time_name == '' || expected_time_value == -1){
        Notify({ type: 'danger', message: '请选择期望收货时间' });
        return false
      }
      return true
    },

    //获取本地时间，离派送时间差1小时不显示派送时间
    time_show:function(){
      let that = this
      let expected_time_select = that.data.expected_time_select
      let now = new Date()
      let now_hour = now.getHours()
      let expected_time_name = String 
      let expected_time_value = Number
      if( 12-now_hour <= 1  & 17- now_hour > 1 ){
        expected_time_select[0].subname = '已过可预定时间(中午11点)'
        expected_time_select[0].disabled = true
        expected_time_value = 1
        expected_time_name = expected_time_select[1].name

      }else if(17-now_hour <= 1 & 20-now_hour > 1){
        expected_time_select[0].subname = '已过可预定时间(中午11点)'
        expected_time_select[0].disabled = true
        expected_time_select[1].subname = '已过可预定时间(下午4点)'
        expected_time_select[1].disabled = true
        expected_time_value = 2
        expected_time_name = expected_time_select[2].name

      }
      // else if(20-now_hour <= 1 & 20-now_hour > -4){
      //   expected_time_select[0].subname = '已过可预定时间(中午11点)'
      //   expected_time_select[0].disabled = true
      //   expected_time_select[1].subname = '已过可预定时间(下午4点)'
      //   expected_time_select[1].disabled = true
      //   expected_time_select[2].subname = '已过可预定时间(晚上7点)'
      //   expected_time_select[2].disabled = true
      //   expected_time_value = 3
      //   expected_time_name = expected_time_select[3].name

      // }
      else{
        expected_time_name = expected_time_select[0].name
      }
      that.setData({expected_time_select:expected_time_select,expected_time_value:expected_time_value,expected_time_name:expected_time_name})

    },

    //根据value将时间转换为标准的时间格式
    expected_time_date:function(expected_time_value){
      let that = this
      let expected_time = new Date()
      let now_day = expected_time.getDate()

      expected_time.setMinutes(0)
      expected_time.setSeconds(0)
      switch(expected_time_value){
        case 0:
          expected_time.setHours(12)
          break;
        case 1:
          expected_time.setHours(17)
          break;
        // case 2:
        //   expected_time.setHours(20)
        //   break;
        case 3:
          expected_time.setHours(12)
          expected_time.setDate(now_day+1)
          console.log(expected_time)
          break;
        case 4:
          expected_time.setHours(17)
          expected_time.setDate(now_day+1)
          break;
        // case 5:
        //   expected_time.setHours(20)
        //   expected_time.setDate(now_day+1)
        //   break;
      }   
      let order_id = that.data.order_id
      let expected_time_str = expected_time.toISOString()
      let data_change = {'expected_time':expected_time_str,'id':order_id}
      that.information_change(data_change)
      that.setData({expected_time:expected_time.toISOString()})
    },

    //全场折扣活动
    all_goods_discount:function(){
      var that  = this 
      let sum = that.data.sum
      let dicount_amount =(0.05*sum).toFixed(2)
      let dicount_amount_color = '#EE0A24'
      that.total_price()
      that.setData({'dicount_amount':'-₩'+dicount_amount,'all_dicount_amount':dicount_amount,dicount_amount_color:dicount_amount_color})
    },


    
    //询问是否同意接受订阅消息
    subscribe_message:function(order_id,result){
      // 如果结果为true
      if(result == true){
        wx.requestSubscribeMessage({
          tmplIds: ['fUR2WRkqeHi8FfAZIEDZpKA2tZBcHdrc1e317CRxBpE','LgpDjVyIZ61njYiblAc3xnqInKNXkMRYt5G8F1wf47Y','WZffXR5U8KrTghwGajX5rLIjlyWOd4Wwl2vllp-vKE0'],
          success:function (res) {
            let csrftoken = wx.getStorageSync('csrftoken')
            let csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
            let Token = wx.getStorageSync('Token')
            wx.request({
              url: app.globalData.URL+'/order_manage/order_business_message/',
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
  
              },
              success:function(res){
  
              },
              complete:function(){
                setTimeout(function(){
                  wx.reLaunch({url:'../index/index'})
                },800)
              }
            })
            
  
             },
          
        })
  

      }

    },
    

    //修改信息时，异步传入数据库
    information_change(data_change){
      wx.showLoading({
        title: '修改中',
      })
      var that = this
      var csrftoken = wx.getStorageSync('csrftoken')
      var csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
      var Token = wx.getStorageSync('Token')
      
      wx.request({
        url: app.globalData.URL+'/pay/pay_information_change/',
        method:"POST",
        dataType:JSON,
        header:{
        'content-type': 'application/x-www-form-urlencoded', // 默认值
        'cookie':csrf_token_cookie,
        "x-csrftoken":csrftoken
        },
        data:data_change,
        success:function (res) {
          let data = JSON.parse(res.data)
          let carriage = data.carriage
          let payment_amount = data.payment_amount
          let sum_price = data.sum_price
          that.setData({sum:sum_price,freight:carriage,sum_price:payment_amount})
          wx.hideLoading()
        }
      })


    },
  


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (option) {

        

        // Toast.loading({
        //   message: '加载中...',
        //   forbidClick: true,
        //   loadingType: 'spinner',
        // });
        // Toast.clear();
        wx.showLoading({
          title: '加载中',
        })
        var that = this
        // that.ip_get()
        const eventChannel = that.getOpenerEventChannel()
        eventChannel.on('acceptDataFromOpenerPage', function(data) {
            var goods_dic_list = data.goods_dic_list
            var goods_preferential = data.goods_preferential
            var order_id = data.order_id
            var consignee_name = data.consignee_name
            var consignee_number = data.consignee_number
            var consignee_address = data.consignee_address
            var integral_number = data.integral_number
            var freight = data.freight
            var payment_amount = data.payment_amount

  
            var sum = data.sum
            let max_integral = Number
            if(sum * 0.1  > integral_number * 10){
              max_integral = integral_number
              
            }else if(sum * 0.1 <= integral_number * 10 ){
              max_integral = Math.floor(sum * 0.1/10)
            }
            
            that.setData({goods_dic_list:goods_dic_list,                        goods_preferential:goods_preferential,order_id:order_id,
                sum:sum,consignee_name:consignee_name,consignee_number:consignee_number,consignee_address:consignee_address,
                integral_number:'可用积分：'+max_integral,
                max_integral:max_integral,sum_price:payment_amount,freight:freight,

                })
            that.all_goods_discount()
            that.total_price()

          })

        
        var integral_number = that.data.integral_number
        if(integral_number == ''){
          that.setData({integral_number:'无可用'})
        }else{
          that.setData({text_color:'#EE0A24'})
        }
        
        // that.make_detail()

        //是否开启全场折扣
        that.all_goods_discount()
        that.total_price()
        
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
      wx.hideLoading()
      // var that = this
      // that.freight_manage()
      // that.total_price()
      // Toast.clear();
        
        
    },
    //获取地址信息
    get_address:function() {
        var that = this;
        var csrftoken = wx.getStorageSync('csrftoken')
        var csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
        var Token = wx.getStorageSync('Token')
        wx.request({
          url: app.globalData.URL+'/user/wx_get_default_address/',
          method:"POST",
          dataType:JSON, 
          header:{
            'content-type': 'application/x-www-form-urlencoded', // 默认值
            'cookie':csrf_token_cookie,
            "x-csrftoken":csrftoken
          },
          data:{'Token':Token,},
          success:function (e) {
            let address_default = JSON.parse(e.data)
            that.setData({'address_default':address_default,})
            
          }
        })
      },



    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
      // let that = this
      // var canel_minute = that.data.canel_minute
      // var canel_second = that.data.canel_second
      // that.freight_manage()
      // that.total_price()
      // that.make_nonce_str()
      // Toast.clear();
      // that.time_show()
      wx.enableAlertBeforeUnload({
        message:'确定离开当前页面吗',
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
    onShareAppMessage: function () {

    }







    // 待弃用
    
    //运费字体颜色变换
    // freight_manage(){
    //   var that = this
    //   let freight = that.data.freight
    //   let freight_color = ''
    //   if(freight != 0){
    //     freight_color = '#dc3545'
    //   }
    //   that.setData({freight_color:freight_color})
    // },


    
    //生成云支付所需要的nonce_str
    // make_nonce_str(){
    //   let that = this
    //   var result = ''
    //   const wordList = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l','m', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2','3', '4', '5', '6', '7', '8', '9', '0']
    //   for(let i=0;i<30;i++){
    //     result += wordList[Math.round(Math.random()*30)]
    //   }
    //   that.setData({nonce_str:result})
    // },

    //调用云函数支付，支付成功后向后台发送请求
//     payCloud:function(){
//         var that = this
//         let order_id = that.data.order_id
//         let sum = that.data.sum
//         let payment_amount = that.data.sum_price
//         let payment_method = that.data.payment_method
//         let expected_time = that.data.expected_time
//         let consignee_name = that.data.consignee_name
//         let consignee_number = that.data.consignee_number
//         let consignee_address = that.data.consignee_address
//         let integral_number = that.data.use_integral_number
//         let value_remark = that.data.value_remark
//         let csrftoken = wx.getStorageSync('csrftoken')
//         let csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
//         let Token = wx.getStorageSync('Token')
//         let ip = that.data.ip
//         let nonce_str = that.data.nonce_str
        
//         if(payment_method == 0){
//           //向后台发送订单信息
//           wx.request({
//             url: app.globalData.URL+'/pay/wx_submit_order/',
//             method:"POST",
//             dataType:JSON,
//             header:{
//             'content-type': 'application/x-www-form-urlencoded', // 默认值
//             'cookie':csrf_token_cookie,
//             "x-csrftoken":csrftoken
//             },
//             data:{
//               'Token':Token,
//               'order_id':order_id,
//               'sum_price':sum,
//               'payment_amount':payment_amount,
//               'payment_method':payment_method,
//               'consignee_name':consignee_name,
//               'consignee_number':consignee_number,
//               'consignee_address':consignee_address,
//               'integral_number':integral_number,
//               'expected_time':expected_time,
//               'value_remark':value_remark
//             },
//             success:function(res){
//               Notify({ type: 'success', message: '订单提交成功' });
//               that.subscribe_message(order_id)
//             }
//           })
//         }
//         else{
//           Toast.loading({
//             message: '订单提交中...',
//             forbidClick: true,
//           });
//           let RMB  = (payment_amount/168).toFixed(2)
//           // let detail = that.make_detail()
//           wx.cloud.callFunction({
//             // 云函数名称
//             name: 'wechat_pay',
//             // 传给云函数的参数
//             data: {
//               order_id: order_id,
//               total_fee: RMB,
//               ip:ip,
//               nonce_str:nonce_str
//               // detail:detail.toString()
//             },
//             success: res => {
//               console.log(res)
//               const payment = res.result.payment
//               console.log(payment)
//               wx.requestPayment({ 
//                 ...payment,
//                 success (res) {
//                   Notify({ type: 'success', message: '支付成功' });
//                   Toast.clear();

//                   //向后台发送订单信息
//                   wx.request({
//                     url: app.globalData.URL+'/pay/wx_submit_order/',
//                     method:"POST",
//                     dataType:JSON,
//                     header:{
//                     'content-type': 'application/x-www-form-urlencoded', // 默认值
//                     'cookie':csrf_token_cookie,
//                     "x-csrftoken":csrftoken
//                     },
//                     data:{
//                       'Token':Token,
//                       'order_id':order_id,
//                       'sum_price':sum,
//                       'payment_amount':payment_amount,
//                       'payment_method':payment_method,
//                       'consignee_name':consignee_name,
//                       'consignee_number':consignee_number,
//                       'consignee_address':consignee_address,
//                       'integral_number':integral_number,
//                       'expected_time':expected_time,
//                       'payment_result':true,
//                       'value_remark':value_remark
//                     },
//                     success:function(res){
//                       Toast.success('订单提交成功');
//                       that.subscribe_message(order_id)
//                     },
//                     fail:function(){
//                       wx.request({
//                         url: app.globalData.URL+'/pay/wx_submit_order/',
//                         method:"POST",
//                         dataType:JSON,
//                         header:{
//                         'content-type': 'application/x-www-form-urlencoded', // 默认值
//                         'cookie':csrf_token_cookie,
//                         "x-csrftoken":csrftoken
//                         },
//                         data:{
//                           'Token':Token,
//                           'order_id':order_id,
//                           'sum_price':sum,
//                           'payment_amount':payment_amount,
//                           'payment_method':payment_method,
//                           'consignee_name':consignee_name,
//                           'consignee_number':consignee_number,
//                           'consignee_address':consignee_address,
//                           'integral_number':integral_number,
//                           'expected_time':expected_time,
//                           'payment_result':true,
//                           'value_remark':value_remark
//                         },
//                         success:function(res){
//                           Toast.success('订单提交成功');
//                           that.subscribe_message(order_id)
//                         },
//                       })
//                     }
//                   })
    
                  
//                 },
              
//             fail:res => {
//                //向后台发送订单信息
//                wx.request({
//                 url: app.globalData.URL+'/pay/wx_submit_order/',
//                 method:"POST",
//                 dataType:JSON,
//                 header:{
//                 'content-type': 'application/x-www-form-urlencoded', // 默认值
//                 'cookie':csrf_token_cookie,
//                 "x-csrftoken":csrftoken
//                 },
//                 data:{
//                   'Token':Token,
//                   'order_id':order_id,
//                   'sum_price':sum,
//                   'payment_amount':payment_amount,
//                   'payment_method':payment_method,
//                   'consignee_name':consignee_name,
//                   'consignee_number':consignee_number,
//                   'consignee_address':consignee_address,
//                   'integral_number':integral_number,
//                   'expected_time':expected_time,
//                   'payment_result':false,
//                   'value_remark':value_remark
//                 },
//                 success:function(res){
//                   Toast.fail('订单提交失败\n请重新提交');
//                 }
//           })

//             }
//           })

//         }
      
//     })
//   }
// }, 


    //后端获取用户IP
    // ip_get:function(){ 
    //   let that =  this
    //   wx.request({
    //     url: app.globalData.URL+'/user/ip_get/',
    //     method:'GET',
    //     success:function(res){
    //       let ip = res.data
    //       that.setData({ip:ip})
    //       Toast.clear()
    //     }
        
    //   })
    // },







})