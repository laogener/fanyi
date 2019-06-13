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
        alert(1,'复制成功')
    }
});
// 下载转译结果
$("#download").click(function () {
    var title = '';
    if($('#title').val().length > 0 ){
        title = $('#title').val();
    }else{
        title = new Date().getTime();
    }
    $('#download').attr('download',title+'.txt');
    var isIE = (navigator.userAgent.indexOf('MSIE') >= 0);
    if (isIE) {
        var strHTML = $("#wei").val();
        var winSave = window.open();
        winSave.document.open("text","utf-8");
        winSave.document.write(strHTML);
        winSave.document.execCommand("SaveAs",true,title+".txt");
        winSave.close();
    } else {
        var elHtml = $("#wei").val();
        var mimeType =  'text/plain';
        $('#download').attr('href', 'data:' + mimeType  +  ';charset=utf-8,' + encodeURIComponent(elHtml));
        // document.getElementById('download').click();
    }
});
// 弹窗
function alert(num,txt) {
    $('.alert span').text(txt);
    if(num = 1){
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
function baidu_youdao(){
    var appid = '20190612000306950';
    var key = 'gFouyIVW0ciO8Zw9hvIE';
    var salt = (new Date).getTime();
    var query = $('#yuan').val();
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
                    signType: "v3"
                },
                success: function (data) {
                    if(data.errorCode > 0){
                        alert(0,'转译失败，请打开控制台查看');
                    }else{
                        alert(1,'转译成功');
                        $('#wei').html(data.translation[0]);
                    }

                }
            });
        }
    });
}
// 有道-英文-百度-中文
function youdao_baidu(){
    // 有道
    var appKey = '53e4d80b4b05941e';
    var key = 'BdlRMuHxlFqD5eZuDJGU8VwIVJhmpG6F';//注意：暴露appSecret，有被盗用造成损失的风险
    var salt = new Date().getTime();
    var curtime=Math.round(new Date().getTime()/1000);
    var duan = $('#yuan').val().split('\n');
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
            signType: "v3"
        },
        success: function (data) {
            var appid = '20190612000306950';
            var key = 'gFouyIVW0ciO8Zw9hvIE';
            var salt = (new Date).getTime();
            console.log(data);
            var query = data.translation[0];
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
                    sign: sign
                },
                success: function (data) {
                    var trans_result='';
                    for(var i=0;i<data.trans_result.length;i++){
                        trans_result += data.trans_result[i].dst +'\n\n';
                    }
                    alert(1,'转译成功');
                    $('#wei').html(trans_result);
                }
            });

        }
    });
}
$('#yi').click(function () {
    if($('.txt').attr('way') == 1){
        youdao_baidu();
    }else{
        baidu_youdao()
    }
});
