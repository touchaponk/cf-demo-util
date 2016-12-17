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
            url: "https://api."+window.dc+".bluemix.net/v2/apps",
            headers: {
                "Authorization": "bearer " + window.access_token
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
                $("#apptable").DataTable({
                    ordering: false
                });
            })
            .fail(function (error) {
                alert(error.statusText);
            });
    },
    componentDidUpdate: function () {
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
                        <i className="fa fa-gears"></i>All Applications
                    </div>
                    <div className="tools">
                        <a href="javascript:;" className="reload" data-original-title="" title=""> </a>
                    </div>
                </div>
                <div className="portlet-body">
                        <table id="apptable" className="table table-striped table-hover" style={{
                            width: "98% !important",
                            marginLeft: "1% !important"
                        }}>
                            <thead>
                            <tr>
                                <th> Actions</th>
                                <th> Org</th>
                                <th> Space</th>
                                <th> Name</th>
                                <th> State</th>
                                <th> Instances</th>
                                <th> Memory</th>
                                <th> Disk</th>
                            </tr>
                            </thead>
                            <tbody style={{"textAlign": "left"}}>
                            {appData}
                            </tbody>
                        </table>
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
        if (this.props.guid && !hostCache[this.props.guid]) {
            var data = {
                method: "GET",
                url: "https://api."+window.dc+".bluemix.net/v2/apps/" + this.props.guid + "/routes",
                headers: {
                    "Authorization": "bearer " + window.access_token
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
        else {
            self.setState({host: hostCache[this.props.guid]});
        }
        // setInterval(this.refresh, 10000);
    },
    refresh: function (cb) {
        this.setState({loading: true});
        console.log("refreshing ", this.props.guid);
        var self = this;
        var data = {
            method: "GET",
            url: "https://api."+window.dc+".bluemix.net/v2/apps/" + this.props.guid,
            headers: {
                "Authorization": "bearer " + window.access_token
            }
        };
        $.ajax({
            type: "POST",
            url: "/api",
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
        })
            .done(function (json) {
                self.props.app = json.entity;
                self.setState({loading: false});
                if (cb)
                    cb();
            })
            .fail(function (error) {
                if (error.statusText != "OK")alert(error.statusText);
                self.setState({loading: false});
                if (cb)
                    cb();
            });
    },
    doRestage: function () {
        var self = this;
        self.setState({loading: true});
        var data = {
            method: "POST",
            url: "https://api."+window.dc+".bluemix.net/v2/apps/" + self.props.guid + "/restage",
            headers: {
                "Authorization": "bearer " + window.access_token
            }
        };
        $.ajax({
            type: "POST",
            url: "/api",
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
        })
            .done(function (json) {
                self.props.app = json.entity;
                self.refresh(function(){
                    self.setState({loading: false});
                });
                // self.setState({loading: false});
            })
            .fail(function (error) {
                self.props.app = json.entity;
                self.setState({loading: false});
                if (error.statusText != "OK")alert(error.statusText);
            });
    },
    render: function () {
        var kid = "rae-" + this.props.guid;
        var app = this.props.app;
        var space = null;
        var org = null;
        var appurl = "Loading...";
        var urllink = "#";
        if (this.state.host) {
            var url = this.state.host + ".mybluemix.net";
            urllink = "http://" + url;
            appurl = (<a href={urllink} target="_blank">
                <i className="icon-docs"></i> View app </a>);

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
        var state = (<img src="http://developers.gigya.com/download/attachments/14650850/refresh_spin_lg.gif"
                          style={{"width": "20px", "padding": "0"}}/>);
        if (!this.state.loading) state = app.state == "STARTED" ?
            ( <span className="label label-sm label-success"> {app.state} </span>) :
            ( <span className="label label-sm label-warning"> {app.state} </span>);
        // console.log("toggler is ", this.props.toggler);
        var bmxlink = "https://console."+window.dc+".bluemix.net/apps/"+this.props.guid;
        var bmxUrl = (<a href={bmxlink} target="_blank">
            <i className="fa fa-share"></i> Open in Bluemix </a>);

        return (
            <tr key={kid}>
                {/*<td> {this.props.i} </td>*/}
                <td>
                    <div className="btn-group">
                        <button className="btn btn-xs green dropdown-toggle" type="button"
                                data-toggle="dropdown"
                                aria-expanded="false"> Actions
                            <i className="fa fa-angle-down"></i>
                        </button>
                        <ul className="dropdown-menu" role="menu">
                            <li>
                                <a href="javascript:;" onClick={this.refresh}>
                                    <i className="icon-refresh"></i> Refresh </a>
                            </li>
                            <li>
                                {bmxUrl}
                            </li>
                            <li>
                                {appurl}
                            </li>
                            <li>
                                <a href="javascript:;" onClick={this.props.toggler}>
                                    <i className="fa fa-server"></i> View Instances </a>
                            </li>
                            <li>
                                <a href="javascript:;" onClick={this.doRestage}>
                                    <i className="fa fa-retweet"></i> Restage </a>
                            </li>
                        </ul>
                    </div>
                </td>
                <td> {org.name} </td>
                <td> {space.name} </td>
                <td> {app.name} </td>
                <td> {state} </td>
                <td> {app.instances}
                    {/*<button type="button" className="btn blue btn-sm" style={{*/}
                    {/*"fontSize": "12px",*/}
                    {/*"padding": "1px 7px",*/}
                    {/*"marginLeft": "5px"*/}
                    {/*}} onClick={this.props.toggler}> View*/}
                    {/*</button>*/}
                </td>
                <td> {app.memory} </td>
                <td> {app.disk_quota} </td>
            </tr>
        );
    }
});

var DetailAppEntry = React.createClass({
    getInitialState: function () {
        return {stats: null};
    },
    componentDidMount: function () {
        this.refresh();
    },
    refresh: function (cb) {
        var self = this;
        var data = {
            method: "GET",
            url: "https://api."+window.dc+".bluemix.net/v2/apps/" + this.props.guid + "/stats",
            headers: {
                "Authorization": "bearer " + window.access_token
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
                for (var i in json) {
                    stats.push(json[i]);
                }
                console.log("setting stats ", stats);
                self.setState({stats: stats});
                if (cb)cb();
            })
            .fail(function (error) {
                if (error.statusText != "OK")alert(error.statusText);
                if (cb)cb();
            });
    },
    render: function () {
        var kid = "dae-" + this.props.guid;
        var self = this;
        var instances = this.state.stats ?
            this.state.stats.map(function (instance, index) {
                var iid = "daei-" + index;
                return (<InstanceEntry guid={self.props.guid} key={iid} index={index} instance={instance}
                                       refresh={self.refresh}/>);
            })
            : null;
        return (
            <tr key={kid}>
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

var InstanceEntry = React.createClass({
    getInitialState: function () {
        return {killing: false}
    },
    doKill: function () {
        var self = this;
        self.setState({loading: true});
        var data = {
            method: "DELETE",
            url: "https://api."+window.dc+".bluemix.net/v2/apps/" + self.props.guid + "/instances/" + self.props.index,
            headers: {
                "Authorization": "bearer " + window.access_token
            }
        };
        $.ajax({
            type: "POST",
            url: "/api",
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
        })
            .done(function (json) {
                self.props.refresh(function () {
                    self.setState({loading: false});
                });
            })
            .fail(function (error) {
                self.props.refresh(function () {
                    self.setState({loading: false});
                });
                if (error.statusText != "OK")alert(error.statusText);
            });
    },
    render: function () {
        var self = this;
        var index = this.props.index;
        var instance = this.props.instance;
        console.log("rendering instance with data ", instance);
        var cname = "gradeX " + ((index % 2 == 0) ? "even" : "odd");
        var state = (<img src="http://developers.gigya.com/download/attachments/14650850/refresh_spin_lg.gif"
                          style={{"width": "20px", "padding": "0"}}/>);
        if (!this.state.loading)state = instance.state == "RUNNING" ?
            ( <span className="label label-sm label-success"> {instance.state} </span>) :
            ( <span className="label label-sm label-warning"> {instance.state} </span>);
        var tstamp = instance.stats ? new Date(new Date().getTime() - instance.stats.uptime * 1000).toString() : "-";
        var cpu = instance.stats ? Math.round(instance.stats.usage.cpu * 100) : "-";
        var mem = instance.stats ? (Math.round(instance.stats.usage.mem / 1000000) + " MB") : "-";
        var disk = instance.stats ? (Math.round(instance.stats.usage.disk / 1000000) + " MB") : "-";
        return (
            <tr className={cname} role="row">
                <td className="sorting_1">{index}</td>
                <td>{state}</td>
                <td className="center">{tstamp}</td>

                <td className="center">{cpu}</td>
                <td className="center">{mem}</td>
                <td className="center">{disk}</td>
                <td>
                    <div className="btn-group">
                        <button className="btn btn-xs green dropdown-toggle" type="button"
                                data-toggle="dropdown"
                                aria-expanded="false"> Actions
                            <i className="fa fa-angle-down"></i>
                        </button>
                        <ul className="dropdown-menu" role="menu">
                            <li>
                                <a href="javascript:;" onClick={this.doKill}>
                                    <i className="icon-docs"></i> Kill </a>
                            </li>
                        </ul>
                    </div>
                </td>
            </tr>
        );
    }
})
$(document).ready(function () {
    // window.apps = {};
    console.log("initing main script");
    var args = window.location.search.split("&");
    for(var i in args){
        var pair = args[i].replace("?","").split("=");
        window[pair[0]] = pair[1];
    }
    loadOrgsSpaces(function () {
        ReactDOM.render(
            <RunningApps/>, document.getElementById('running-apps-container')
        );
    });
});
function loadOrgsSpaces(cb) {
    var data = {
        method: "GET",
        url: "https://api."+window.dc+".bluemix.net/v2/spaces",
        headers: {
            "Authorization": "bearer " + window.access_token
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
                url: "https://api."+window.dc+".bluemix.net/v2/organizations",
                headers: {
                    "Authorization": "bearer " + window.access_token
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