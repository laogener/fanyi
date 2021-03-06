// 切换转译方式
$('.dropdown-menu').on('click','a',function (e) {
    e.preventDefault();
    $('.txt').text($(this).text());
    $('.txt').attr('way',$(this).attr('way'));
});
// 复制翻译结果
$("#copy").click(function () {
    $('#wei').select();
    if (document.execCommand('copy')) {
        document.execCommand('copy');
        alertTip(1,'复制成功')
    }
});

// 下载文件
// $("#all").prop("disabled", true);
function download(strHTML,num,name){
    var title = '';
    var elHtml = strHTML;
    var mimeType =  'text/plain';
    var href = 'data:' + mimeType  +  ';charset=utf-8,' + encodeURIComponent(elHtml);
    if(num == 1){
        cur++;
        $('.done').text(cur);

        $('#one').append('<a download="'+name+'.txt" href="'+href+'"><span class="buttonA">'+name+'.txt</span></a>　　　');
    }else{
        if($('#title').val().length > 0 ){
            title = $('#title').val();
        }else{
            title = new Date().getTime();
        }
        $('#download').attr('download',name+'.txt');
        $('#download').attr('href', href);
    }
    if(cur == $('.totle').text()){
        $('.buttonA').click();
    }
}
// 下载转译结果
$("#download").click(function () {

    download($('#wei').val());
});
// 弹窗
function alertTip(num,txt) {
    $('.alert span').text(txt);
    if(num == 1){
        $('.alert-success').fadeIn();
    }else {
        $('.alert-warning').fadeIn();
    }
    setTimeout(function () {
        $('.alert').fadeOut();
    },2000)
}
function getInput(input){
    if (input.length == 0) {
        return null;
    }
    var result;
    var len = input.length;
    if(len <= 20){
        result = input;
    }else{
        var startStr = input.substring(0,10);
        var endStr = input.substring(len-10,len);
        result = startStr + len +endStr;
    }
    return result;

}
// 百度-英文-有道-中文
function baidu_youdao(content,num,name){
    var appid = '20190612000306950';
    var key = 'gFouyIVW0ciO8Zw9hvIE';
    var salt = (new Date).getTime();
    var query = content;
    if(query.length >800){
        alertTip(2,'超过800字，无法转译');
        return
    }
    var from = 'zh';
    var to = 'en';
    var str1 = appid + query + salt +key;
    var sign = MD5(str1);
    $.ajax({
        url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
        type: 'get',
        dataType: 'jsonp',
        data: {
            q: query,
            appid: appid,
            salt: salt,
            from: from,
            to: to,
            num: num,
            name: name,
            sign: sign
        },
        success: function (data) {
            // 有道
            var appKey = '53e4d80b4b05941e';
            var key = 'BdlRMuHxlFqD5eZuDJGU8VwIVJhmpG6F';//注意：暴露appSecret，有被盗用造成损失的风险
            var salt = new Date().getTime();
            var curtime=Math.round(new Date().getTime()/1000);
            var trans_result='';
            for(var i=0;i<data.trans_result.length;i++){
                trans_result += data.trans_result[i].dst +'\n\n';
            }
            var query = trans_result;// 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
            var from = 'auto';
            var to = 'zh-CHS';
            var str1 = appKey + getInput(query) + salt + curtime +key;
            var sign = sha256(str1);
            $.ajax({
                url: 'http://openapi.youdao.com/api',
                type: 'post',
                dataType: 'jsonp',
                data: {
                    q: query,
                    appKey: appKey,
                    salt: salt,
                    from: from,
                    to: to,
                    curtime: curtime,
                    sign: sign,
                    num: num,
                    name: name,
                    signType: "v3"
                },
                success: function (data,num) {
                    if(num == 1){
                        download(data.translation[0],num,name)
                    }else{
                        if(data.errorCode > 0){
                            alertTip(2,'转译失败，请打开控制台查看');
                        }else{
                            alertTip(1,'转译成功');
                            $('#wei').html(data.translation[0]);
                        }
                    }


                }
            });
        }
    });
}
// 有道-英文-百度-中文
function youdao_baidu(content,num,name){
    // 有道
    var appKey = '53e4d80b4b05941e';
    var key = 'BdlRMuHxlFqD5eZuDJGU8VwIVJhmpG6F';//注意：暴露appSecret，有被盗用造成损失的风险
    var salt = new Date().getTime();
    var curtime=Math.round(new Date().getTime()/1000);
    var duan = content.split('\n');
    var query = '';// 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    for(var i=0;i<duan.length;i++){
        if(duan[i].length > 0){
            query += duan[i] +'\n\n';
        }
    }
    var from = 'zh-CHS';
    var to = 'en';
    var str1 = appKey + getInput(query) + salt + curtime +key;
    var sign = sha256(str1);
    $.ajax({
        url: 'http://openapi.youdao.com/api',
        type: 'post',
        dataType: 'jsonp',
        data: {
            q: query,
            appKey: appKey,
            salt: salt,
            from: from,
            to: to,
            curtime: curtime,
            sign: sign,
            num: num,
            name: name,
            signType: "v3"
        },
        success: function (data) {
            var appid = '20190612000306950';
            var key = 'gFouyIVW0ciO8Zw9hvIE';
            var salt = (new Date).getTime();
            var query = data.translation[0];
            if(query.length >1800){
                alertTip(2,'超过800字，无法转译');
                return
            }
            var from = 'en';
            var to = 'zh';
            var str1 = appid + query + salt +key;
            var sign = MD5(str1);
            $.ajax({
                url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
                type: 'get',
                dataType: 'jsonp',
                data: {
                    q: query,
                    appid: appid,
                    salt: salt,
                    from: from,
                    to: to,
                    num: num,
                    name: name,
                    sign: sign
                },
                success: function (data) {
                    var trans_result='';
                    for(var i=0;i<data.trans_result.length;i++){
                        trans_result += data.trans_result[i].dst +'\n\n';
                    }
                    if(num == 1){
                        download(trans_result,num,name);
                    }else{
                        alertTip(1,'转译成功');
                        $('#wei').html(trans_result);
                    }

                }
            });

        }
    });
}
// 单篇翻译
$('#yi').click(function () {
    var content = $('#yuan').val();
    if($('.txt').attr('way') == 1){
        youdao_baidu(content);
    }else{
        baidu_youdao(content)
    }
});
// 批量翻译
var txtname = [],cur = 0;
$('#pi').click(function () {
    txtname = [];
    cur = 0;
    if (window.FileReader) {
        var files = document.getElementById("file").files;
        $('.totle').text(files.length);

        for (let i = 0; i < files.length; i++) {
            if(files[i].size > 1850){
                alert(files[i].name+'超过800字');
                return
            }
        }
        for (let i = 0; i < files.length; i++) {
            var filename = files[i].name.split(".")[0];
            txtname.push(filename);
            var reader = new FileReader();
            reader.readAsText(files[i],'UTF-8');
            reader.onload = function () {
                // if($('.txt').attr('way') == 1){
                //     youdao_baidu(this.result,1,files[i].name);
                // }else{
                //     baidu_youdao(this.result,1,files[i].name)
                // }
                youdao_baidu(this.result,1,files[i].name);
            }

        }
    }else{

    }
});
// 一键下载
$('#all').click(function () {
    $('.buttonA').click();
});

document.getElementById("file").onchange = function () {
    txtname = [];
    cur = 0;
    if (window.FileReader) {
        var files = document.getElementById("file").files;
        $('.totle').text(files.length);

        for (let i = 0; i < files.length; i++) {
            if(files[i].size > 1850){
                alert(files[i].name+'超过800字');
                return
            }
        }
        for (let i = 0; i < files.length; i++) {
            var filename = files[i].name.split(".")[0];
            txtname.push(filename);
            var reader = new FileReader();
            reader.readAsText(files[i],'UTF-8');
            reader.onload = function () {
                // if($('.txt').attr('way') == 1){
                //     youdao_baidu(this.result,1,files[i].name);
                // }else{
                //     baidu_youdao(this.result,1,files[i].name)
                // }
                youdao_baidu(this.result,1,files[i].name);
            }

        }
    }else{

    }
}
// 批量生成sitemap地图
var nets ='',mapUrl='';
document.getElementById("nets").onchange = function () {
    nets ='';
    var files = document.getElementById("nets").files;
    var reader = new FileReader();
    reader.readAsText(files[0],'UTF-8');
    reader.onload = function () {
        mapUrl = ''
        nets = this.result.split(',');
        for(var i=0;i<nets.length;i++){
            mapUrl+=$.trim(nets[i])+'/sitemap.xml\r' ;
            window.open($.trim(nets[i])+'/plus/task/generate_sitemap.php');
        }
        console.log(mapUrl);
        $('#mapUrl').html(mapUrl);
    }
}
$('#map').click(function () {
    $('#mapUrl').select();
    if (document.execCommand('copy')) {
        document.execCommand('copy');
        alertTip(1,'复制成功')
    }
})

// document.oncontextmenu = function () { return false; };
// document.onkeydown = function () {
//     if (window.event && window.event.keyCode == 123) {
//         event.keyCode = 0;
//         event.returnValue = false;
//         return false;
//     }
// };