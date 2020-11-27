Page({
    data:{
        //搜索框的内容
        value:"", 
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
    }

    
})