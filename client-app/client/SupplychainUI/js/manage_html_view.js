$(document).ready(function() {

    $("#index_view").show();
    $("#firstchannelView").hide();
    $("#secondchannelView").hide();

   

$("#alice_login_html").click(function() {
    
   $("#cover-spin").show();
   $("#secondchannelView").hide();
   $("#index_view").hide();
   $("#firstchannelView").show();
   document.getElementById("firstchannel_defaultOpen").click();
   setTimeout(function(){ $("#cover-spin").hide(); }, 1000);
});

$("#fromfirst_firstchannel").click(function() {
   $("#cover-spin").show();
   $("#secondchannelView").hide();
   $("#firstchannelView").show();
   document.getElementById("firstchannel_defaultOpen").click();
   setTimeout(function(){ $("#cover-spin").hide(); }, 1000);
});

$("#fromfirst_secondchannel").click(function() {
   $("#cover-spin").show();
   $("#firstchannelView").hide();
   $("#secondchannelView").show();  
   document.getElementById("secondchannel_defaultOpen").click(); 
   setTimeout(function(){ $("#cover-spin").hide(); }, 1000);
});

$("#fromsecond_firstchannel").click(function() {
   $("#cover-spin").show();
   $("#secondchannelView").hide();
   $("#firstchannelView").show();
   document.getElementById("firstchannel_defaultOpen").click();
   setTimeout(function(){ $("#cover-spin").hide(); }, 1000);
});

$("#fromsecond_secondchannel").click(function() {
   $("#cover-spin").show();
   $("#firstchannelView").hide();
   $("#secondchannelView").show();
   document.getElementById("secondchannel_defaultOpen").click();   
   setTimeout(function(){ $("#cover-spin").hide(); }, 1000);
});

$("#sign_out").click(function() {
    $("#cover-spin").show();
    $("#firstchannelView").hide();
    $("#secondchannelView").hide();
    $("#index_view").show();
    setTimeout(function(){ $("#cover-spin").hide(); }, 1000);

});


$("#sign_out_second").click(function() {
   $("#cover-spin").show();
   $("#firstchannelView").hide();
   $("#secondchannelView").hide();
   $("#index_view").show();
   setTimeout(function(){ $("#cover-spin").hide(); }, 1000);

});


});

