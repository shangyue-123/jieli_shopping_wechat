const app = getApp()
Page({
    data:{
        //搜索框的内容
        search_value:"", 

        //轮播图测试
        bananer_value:"测试",

        //倒计时
        time:30*60*60*1000,
        timeData:{},

        //轮播图
        indicatorDots:true,
        autoplay:true,
        interval:2000,
        duration:500,
        background:[app.globalData.URL+'/static/img/banner/banner_1.jpg',
                    app.globalData.URL+'/static/img/banner/banner_2.jpg',
                    app.globalData.URL+'/static/img/banner/banner_3.jpg',],

        // 商品图标列表（图片名和路径名称一致）
        image_icon:['食品','饮料','调料','生活用品','化妆品','手机卡',],

        //从后端获取特惠商品信息
        goods_dic_list:[],

        
    },

    

    // 搜索栏事件

    //搜索栏变化
    onChange(e){
        this.setData({
            value:e.detail,
        })
    },

    //回车搜索
    onSearch(){
        // Toast('搜索'+this.data.value);
        console.log('搜索'+this.data.value);
    },

    //点击搜索
    onClick(){
        console.log('搜索'+this.data.value)
    },

    // 倒计时
    time_onChange(e){
        this.setData({
            timeData:e.detail,
        })
    },

    onLoad:function(){
        var that = this;
        var csrf = wx.getStorageSync('csrftoken')
        
        // 获取特价商品信息
        wx.request({
          url: app.globalData.URL+'/index/',
          method:'GET',
          dataType:JSON,
          header:{
            'content-type': 'application/json' // 默认值
          },
          success:function(res){
            var goods_dic_list = JSON.parse(res.data)
            // console.log(typeof goods_dic_list)
            // console.log(goods_dic_list)
            that.setData({goods_dic_list:goods_dic_list})
          },
        }),
        
        wx.request({
            url: app.globalData.URL+'/goods/product_list/',
            method:'POST',
            data:csrf,
            dataType:JSON,
            header:{
              'content-type': 'application/json' // 默认值
            },
            success:function(res){

                console.log(res)
            
            },
    
          })
        
    }

    
})