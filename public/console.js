/**
 * Created by touchaponk on 12/3/16.
 */

var RunningApps = React.createClass({
    getInitialState: function () {
        return {apps: [], isopen: []};
    },
    componentDidMount: function () {
        console.log("mounting runningapps");
        var data = {
            method: "GET",
            url: "https://api.ng.bluemix.net/v2/apps",
            headers: {
                "Authorization": "bearer " + window.token
            }
        };
        var self = this;
        $.ajax({
            type: "POST",
            url: "/api",
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
        })
            .done(function (json) {
                self.setState({apps: json.resources});
            })
            .fail(function (error) {
                alert(error.statusText);
            });
    },
    render: function () {
        var self = this;
        var appData = this.state.apps.map(function (app, i) {
            var toggler = function () {
                // console.log("tg ", isopn);
                var isopn = self.state.isopen;
                if (isopn[i]) isopn[i] = false;
                else isopn[i] = true;
                // console.log("toggled ", isopn);
                self.setState({isopen: isopn});
            };
            if (self.state.isopen[i]) {
                var di = "detail-" + i;
                return [
                    <RunningAppEntry key={i} i={i} toggler={toggler} app={app.entity} guid={app.metadata.guid}/>,
                    <DetailAppEntry key={di} i={i} app={app.entity} guid={app.metadata.guid}/>
                ];
            }
            else {
                return (
                    <RunningAppEntry key={i} i={i} toggler={toggler} app={app.entity} guid={app.metadata.guid}/>
                );

            }
        });
        return (
            <div className="portlet box green">
                <div className="portlet-title">
                    <div className="caption">
                        <i className="fa fa-gears"></i>Running Applications
                    </div>
                    <div className="tools">
                        <a href="javascript:;" className="reload" data-original-title="" title=""> </a>
                    </div>
                </div>
                <div className="portlet-body">
                    <div className="table-scrollable">
                        <table className="table table-striped table-hover">
                            <thead>
                            <tr>
                                <th> #</th>
                                <th> Org</th>
                                <th> Space</th>
                                <th> Name</th>
                                <th> State</th>
                                <th> Instances</th>
                                <th> Memory</th>
                                <th> Disk</th>
                                <th> Urls</th>
                            </tr>
                            </thead>
                            <tbody style={{"textAlign": "left"}}>
                            {appData}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
});
var hostCache = {};
var RunningAppEntry = React.createClass({
    getInitialState: function () {
        return {host: null};
    },
    componentDidMount: function () {
        var self = this;
        if(this.props.guid && !hostCache[this.props.guid]){
            var data = {
                method: "GET",
                url: "https://api.ng.bluemix.net/v2/apps/" + this.props.guid + "/routes",
                headers: {
                    "Authorization": "bearer " + window.token
                }
            };
            $.ajax({
                type: "POST",
                url: "/api",
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
            })
                .done(function (json) {
                    hostCache[self.props.guid] = json.resources[0].entity.host;
                    self.setState({host: json.resources[0].entity.host});
                })
                .fail(function (error) {
                    alert(error.statusText);
                });
        }
        else{
            self.setState({host: hostCache[this.props.guid]});
        }
    },
    render: function () {
        var kid = "rae-"+this.props.guid;
        var app = this.props.app;
        var space = null;
        var org = null;
        var appurl = "Loading...";
        if (this.state.host) {
            var url = this.state.host + ".mybluemix.net";
            var urllink = "http://" + url;
            appurl = (<a href={urllink} target="_blank">{url}</a>);
        }
        for (var i in window.spaces) {
            var sp = window.spaces[i];
            if (app.space_url == sp.metadata.url) {
                space = sp.entity;
            }
        }
        for (var j in window.orgs) {
            var or = window.orgs[j];
            // console.log("Evaling ",space.organization_url," vs ",or.metadata.url)
            if (space.organization_url == or.metadata.url)
                org = or.entity;
        }
        var state = app.state == "STARTED" ?
            ( <span className="label label-sm label-success"> {app.state} </span>) :
            ( <span className="label label-sm label-warning"> {app.state} </span>);
        // console.log("toggler is ", this.props.toggler);
        return (
            <tr key = {kid}>
                <td> {this.props.i} </td>
                <td> {org.name} </td>
                <td> {space.name} </td>
                <td> {app.name} </td>
                <td> {state} </td>
                <td> {app.instances}
                    <button type="button" className="btn blue btn-sm" style={{
                        "fontSize": "12px",
                        "padding": "1px 7px",
                        "marginLeft": "5px"
                    }} onClick={this.props.toggler}> View
                    </button>
                </td>
                <td> {app.memory} </td>
                <td> {app.disk_quota} </td>
                <td> {appurl} </td>
            </tr>
        );
    }
});

var DetailAppEntry = React.createClass({
    getInitialState: function () {
        return {stats: null};
    },
    componentDidMount: function () {
        var self = this;
        var data = {
            method: "GET",
            url: "https://api.ng.bluemix.net/v2/apps/" + this.props.guid + "/stats",
            headers: {
                "Authorization": "bearer " + window.token
            }
        };
        $.ajax({
            type: "POST",
            url: "/api",
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
        })
            .done(function (json) {
                var stats = [];
                for(var i in json){
                    stats.push(json[i]);
                }
                self.setState({stats: stats});
            })
            .fail(function (error) {
                alert(error.statusText);
            });
    },
    render: function () {
        var kid = "dae-"+this.props.guid;
        var self = this;
        var instances = this.state.stats ?
            this.state.stats.map(function (instance, index) {
                var iid = "daei-"+index;
                var cname = "gradeX " + ((index % 2 == 0) ? "even" : "odd");
                var state = instance.state == "RUNNING" ?
                    ( <span className="label label-sm label-success"> {instance.state} </span>) :
                    ( <span className="label label-sm label-warning"> {instance.state} </span>);
                var tstamp = new Date(new Date().getTime() - instance.stats.uptime * 1000).toString();
                var doKill = function(){
                    var data = {
                        method: "DELETE",
                        url: "https://api.ng.bluemix.net/v2/apps/" + this.props.guid + "/instances/"+index,
                        headers: {
                            "Authorization": "bearer " + window.token
                        }
                    };
                    $.ajax({
                        type: "POST",
                        url: "/api",
                        data: JSON.stringify(data),
                        contentType: 'application/json; charset=utf-8',
                    })
                        .done(function (json) {
                        })
                        .fail(function (error) {
                            alert(error.statusText);
                        });
                };
                return (
                    <tr key = {iid} className={cname} role="row">

                        <td className="sorting_1">{index}</td>
                        <td>{state}</td>
                        <td className="center">{tstamp}</td>

                        <td className="center">{instance.stats.usage.cpu}</td>
                        <td className="center">{instance.stats.usage.mem}</td>
                        <td className="center">{instance.stats.usage.disk}</td>
                        <td>
                            <div className="btn-group">
                                <button className="btn btn-xs green dropdown-toggle" type="button"
                                        data-toggle="dropdown"
                                        aria-expanded="false"> Actions
                                    <i className="fa fa-angle-down"></i>
                                </button>
                                <ul className="dropdown-menu" role="menu">
                                    <li>
                                        <a href="javascript:void();" onClick={doKill}>
                                            <i className="icon-docs"></i> Kill </a>
                                    </li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                );
            })
            : null;
        return (
            <tr key = {kid}>
                <td colSpan="9">
                    <table
                        className="table table-striped table-bordered table-hover table-checkable order-column dataTable no-footer"
                        id="sample_1" role="grid" aria-describedby="sample_1_info">
                        <thead>
                        <tr role="row">
                            <th>#</th>
                            <th>State</th>
                            <th>Since</th>
                            <th>CPU</th>
                            <th>Memory</th>
                            <th>Disk</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {instances}
                        </tbody>
                    </table>
                </td>
            </tr>
        );
    }
});
$(document).ready(function () {
    // window.apps = {};
    console.log("initing main script");
    window.token = window.location.search.replace("?access_token=", "");
    loadOrgsSpaces(function () {
        ReactDOM.render(
            <RunningApps/>, document.getElementById('running-apps-container')
        );
    });
});
function loadOrgsSpaces(cb) {
    var data = {
        method: "GET",
        url: "https://api.ng.bluemix.net/v2/spaces",
        headers: {
            "Authorization": "bearer " + window.token
        }
    };
    $.ajax({
        type: "POST",
        url: "/api",
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
    })
        .done(function (json) {
            window.spaces = json.resources;
            var data = {
                method: "GET",
                url: "https://api.ng.bluemix.net/v2/organizations",
                headers: {
                    "Authorization": "bearer " + window.token
                }
            };
            $.ajax({
                type: "POST",
                url: "/api",
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
            })
                .done(function (json) {
                    window.orgs = json.resources;
                    cb();
                })
                .fail(function (error) {
                    alert(error.statusText);
                });
        })
        .fail(function (error) {
            alert(error.statusText);
        });
}