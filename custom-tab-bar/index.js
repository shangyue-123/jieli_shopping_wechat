const app = getApp()
Component({
    data: {
        active: 0,
        list:[
            {
                url:"/pages/index/index",
                icon:app.globalData.URL+'/static/img/icons/主页.svg',
                text:'主页'

            },
            {
                url:"/pages/goods/goods",
                icon:app.globalData.URL+'/static/img/icons/商品.svg',
                text:"商品"

            },
            {   
                url:"",
                icon:app.globalData.URL+'/static/img/icons/消息.svg',
                text:"客服"
            },
            {
                url:"/pages/cart/cart",
                icon:app.globalData.URL+'/static/img/icons/购物车.svg',
                text:'购物车',
                info:Number
                

            },
            {
                url:"/pages/user/user",
                icon:app.globalData.URL+'/static/img/icons/我的.svg',
                text:'我的',
                
                

            },

        ]
    },
    methods: {
        onChange(e) {
            this.setData({ active: e.detail });
            wx.switchTab({
                url: this.data.list[e.detail].url
            });
           
        },
        
        init() {
            const page = getCurrentPages().pop();
            this.cart_number_change();
			this.setData({
				active: this.data.list.findIndex(item => item.url === `/${page.route}`)
			});
        },
        
        cart_number_change:function(){
            var csrftoken = wx.getStorageSync('csrftoken')
            var csrf_token_cookie = wx.getStorageSync('csrf_token_cookie')
            let Token = wx.getStorageSync('Token')
            var that = this

            wx.request({
                url: app.globalData.URL+'/cart/cart_number/',
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
                fail:function(){
                    that.cart_number_change()
                },
                success:function(res){
                    if(res.statusCode == 403 | res.statusCode == 500 ){
                        setTimeout(that.cart_number_change(),5000)
                        
                    }
                    else{
                        var data = JSON.parse(res.data)
                        var cart_number = data.cart_goods_quantity__sum
                        that.setData({'list[3].info':cart_number})
                    }
                    
                },
           })

        }
        
    }
   
})
