/**
 * Created by touchaponk on 12/3/16.
 */
$(document).ready(function () {
    console.log("initing main script");
    $("#login-btn").click(function (e) {
        e.preventDefault();
        $(".login-fm").hide();
        $(".load-fm").show();
        var dc = $("#dc").val();
        var data = {
            method: "POST",
            url: "https://login."+dc+".bluemix.net/UAALoginServerWAR/oauth/token",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic Y2Y6"
            },
            form:{
                grant_type: "password",
                scope:"cloud_controller.read cloud_controller.write openid password.write cloud_controller.admin scim.read scim.write uaa.user",
                username: $("#login").val(),
                password: $("#password").val()
            }
        };
        $.ajax({
            type: "POST",
            url: "/api",
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
        })
            .done(function (json) {
                window.location = "./console.html?dc="+dc+"&access_token="+json.access_token;
            })
            .fail(function (error) {
                alert(error.statusText);
                $(".load-fm").hide();
                $(".login-fm").show();
            });
    });
});