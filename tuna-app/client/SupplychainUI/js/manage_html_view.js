$(document).ready(function() {

    $("#index_view").show();
    $("#alice_html").hide();
    $("#mirium_html").hide();
    $("#bob_html").hide();


$("#alice_login_html").click(function() {
   $("#index_view").hide();
   $("#alice_html").show();
});

$("#sign_out").click(function() {
   
    $("#alice_html").hide();
    $("#mirium_html").hide();
    $("#bob_html").hide();
    $("#index_view").show();

});


});
