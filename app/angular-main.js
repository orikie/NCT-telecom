
(function() {

    var app = angular.module('nctTelecom', ['ngRoute']);

    app.value('version', '0.2.3');

    app.value('repoLink', 'https://github.com/linjoey/NCT-telecom');

    app.factory('_globals', function() {
       return {
           peLoaded : false,
           pLoaded : false,
           bxLoaded : false,
           peCostModel: {},
           peCostModel: {},
           bxCostModel: {},
           topoLoaded: false,
           topologyModel: {},
           edgeRouters: [],
           coreRouters: []
       };
    });

    app.factory('loadData', ['$http', 'globalOptions', function($http, globalOptions) {

        return {
            json: function(dataFile, cb) {
                var url = 'data/' + globalOptions[dataFile].value;
                return $http.get(url, {
                    cache: true
                }).success(function(data) {
                    cb(data)
                }).error(function(data){
                    console.log('Cost Model Load Error');
                });
            }
        }
    }]);

    app.factory('networkVisFactory', [function() {

        return function(id, model) {


            if (jQuery.isEmptyObject(model)) {

                model = {
                    "nodes": [],
                    "edges": []
                }
            }

            this.cy = cytoscape({
                container: document.getElementById(id),

                style: [
                    {
                        selector: 'node',
                        css: {
                            'background-color': '#B3767E',
                            'content': 'data(id)',
                            'text-valign': 'center',
                            'text-halign': 'center'
                        }
                    },
                    {
                        selector: '$node > node',
                        css: {
                            'padding-top': '10px',
                            'padding-left': '10px',
                            'padding-bottom': '10px',
                            'padding-right': '10px',
                            'text-valign': 'top',
                            'text-halign': 'center'
                        }
                    },
                    {
                        selector: 'edge',
                        css: {
                            'line-color': '#F2B1BA',
                            'target-arrow-color': '#F2B1BA',
                            'width': 2,
                            'opacity': 0.8
                        }
                    },
                    {
                        selector: ':selected',
                        css: {
                            'background-color': 'red',
                            'line-color': 'red',
                            'target-arrow-color': 'red',
                            'source-arrow-color': 'red',
                            'opacity': 1
                        }
                    },
                    {
                        selector:'.faded',
                        css: {
                            'opacity': 0.25,
                            'text-opacity': 0
                        }
                    }
                ],
                motionBlur: false,
                elements: model,
                maxZoom: 10,
                minZoom: 1,

                layout: {
                    name: 'cose',
                    padding: 5
                }
            });
        };
    }]);

    app.directive('networkVis', ['networkVisFactory','_globals', function(networkVisFactory, _globals) {

        function validTopology(t) {

            if (typeof t !== 'undefined' && !jQuery.isEmptyObject(t)) {
                for(var i = 0; i < t.nodes.length; i++) {
                    if(t.nodes[i].data.id === "") return false;
                }

                for(var j = 0; j < t.edges.length; j++) {
                    var e = t.edges[j];
                    if(e.data.id === "" || e.data.source ==="" || e.data.target ==="")
                        return false;
                }
            }

            return true;
        }

        return {
            restrict : 'E',
            scope : {
                id : '@',
                model: '='
            },
            template:'<button class="btn btn-default" ng-click="reset()">Fit Nodes</button>',
            link: function(scope, element) {

                var nvis = new networkVisFactory(scope.id, _globals.topologyModel);
                element.addClass('network-vis-container');

                scope.$watch('model', function(d) {

                    var v = validTopology(d);
                    if (!jQuery.isEmptyObject(d) && v) {
                        nvis.cy.load(d);
                    }

                    var core = nvis.cy.collection("#Core");
                    if(core.length != 0) {
                        //console.log(core.length);
                        //console.log(core.descendants());
                        _globals.coreRouters = core.descendants();
                    }

                    var edge = nvis.cy.collection("#Edge");
                    if(edge.length != 0) {
                        _globals.edgeRouters = edge.descendants();
                    }

                });

                scope.reset = function() {
                    nvis.cy.fit();
                }

            }
        }

    }]);

    app.factory('globalOptions', [function() {
        return {
            "pe_cost": {
                "name" : "PE Cost File",
                "value" : "pe_cost.json",
                "description": "Provider Edge Router Capital Costs"

            },
            "p_cost": {
                "name" : "P Cost File",
                "value" : "p_cost.json",
                "description": "Provider Core Router Capital Costs"
            },
            "bx_cost": {
                "name" : "BX Cost File",
                "value" : "bx_cost.json",
                "description": "Border Router Capital Costs"
            },
            "network_topo": {
                "name" : "Network Topology File",
                "value" : "network_topology.json",
                "description": "Border Router Capital Costs"
            }

        };
    }]);

    app.controller('MainController', ['$scope', 'version','repoLink', function($scope, version, repoLink) {
        $scope.version = version;
        $scope.repoLink = repoLink;

    }]);

    app.controller('DashController', ['$scope', 'version', function($scope, version) {
    }]);

    app.controller('GeneralConfigController', ['$scope', function($scope) {
    }]);

    app.controller('CostmodelConfigController', ['$scope', 'loadData','_globals', function($scope, loadData, _globals) {


        if(!_globals.peLoaded) {

            loadData.json('pe_cost', function(d) {

                if (typeof d != 'undefined') {
                    _globals.peCostModel = d;
                    _globals.peLoaded = true;
                    $scope.peCost = _globals.peCostModel;
                }
            });
        }
        $scope.peCost = _globals.peCostModel;

        if(!_globals.pLoaded) {

            loadData.json('p_cost', function(d) {

                if (typeof d != 'undefined') {

                    _globals.pCostModel = d;
                    _globals.pLoaded = true;
                    $scope.pCost = _globals.pCostModel;
                }
            });
        }
        $scope.pCost = _globals.pCostModel;

        if(!_globals.bxLoaded) {

            loadData.json('bx_cost', function(d) {

                if (typeof d != 'undefined') {

                    _globals.bxCostModel = d;
                    _globals.bxLoaded = true;
                    $scope.bxCost = _globals.bxCostModel;
                }
            });
        }
        $scope.bxCost = _globals.bxCostModel;

    }]);

    app.controller('TopologyConfigController', ['$scope','loadData','_globals', function($scope, loadData, _globals) {

        if(!_globals.topoLoaded) {
            loadData.json('network_topo', function(d) {

                if (typeof d != 'undefined') {

                    _globals.topologyModel = d;
                    _globals.topoLoaded = true;
                    $scope.topoModel = _globals.topologyModel;
                }
            });
        }
        $scope.topoModel = _globals.topologyModel

    }]);

    app.controller('AnalysisController', ['$scope','_globals', function($scope, _globals) {

        function stringEndsWith(str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }

        var DSL_TYPE = 1;
        var VPN_TYPE = 2;

        $scope.dslClass = "ct-selected";
        $scope.vpnClass = "";

        var connectionType = DSL_TYPE;

        $scope.selConnectionType = function(type){

            if(type==="DSL") {
                $scope.dslClass = "ct-selected";
                $scope.vpnClass = "";
                connectionType = DSL_TYPE;
                $scope.typeLabel = type;

            }
            else if(type==="VPN") {
                $scope.vpnClass = "ct-selected";
                $scope.dslClass = "";
                connectionType = VPN_TYPE;
                $scope.typeLabel = type;
            }

        };

        $scope.selSpeedClick = function(speed) {
            $scope.selSpeed = speed;
            $scope.sel15Class = speed == "15M" ? "active" : "";
            $scope.sel25Class = speed == "25M" ? "active" : "";
            $scope.sel50Class = speed == "50M" ? "active" : "";
            $scope.sel100Class = speed == "100M" ? "active" : "";
            $scope.selGEClass = speed == "1GE" ? "active" : "";
            $scope.sel100GEClass = speed == "100GE" ? "active" : "";
        }

        $scope.selSpeed = "15M";
        $scope.typeLabel = "DSL";
        $scope.sel15Class = "active"
        $scope.sel25Class = "";
        $scope.sel50Class = "";
        $scope.sel100Class = "";
        $scope.selGEClass = "";
        $scope.sel100GEClass = "";

        $scope.edgeRouters = _globals.edgeRouters;
        $scope.coreRouters = _globals.coreRouters;

        $scope.peSelected = ["PE1"];
        $scope.peSel = function(pe) {
            var i = $scope.peSelected.indexOf(pe);
            if( i < 0) {
                $scope.peSelected.push(pe);

            }else {
                $scope.peSelected.splice(i, 1);
            }

            console.log(peNNISlotCost());
        }

        $scope.showPEError = function() {
            return $scope.peSelected.length >= 1 ? false : true;
        }

        $scope.finalCost = 700.30;

        $scope.peCostModel = _globals.peCostModel;
        $scope.pCostModel = _globals.pCostModel;
        $scope.bxCostModel = _globals.bxCostModel;

        var PE_TOTAL_USERS = 2000,
            P_TOTAL_USERS = 15000,
            BX_TOTAL_USERS = 30000,
            WARRANTY_INSTALL_PC = 1.2, //20%
            ROUTER_MAX_UTILIZATION = 0.7; //70%


        function dataReady() {
            return (
                _globals.pLoaded && _globals.peLoaded &&
                _globals.bxLoaded && _globals.topoLoaded
            );
        }

        //Calculate cost of PE Hardware per user
        function peHardwareCost () {
            if (dataReady()) {
                return (
                $scope.peCostModel.hardware.chasis +
                $scope.peCostModel.hardware.memory +
                $scope.peCostModel.hardware.power +
                $scope.peCostModel.hardware.processor
                ) * WARRANTY_INSTALL_PC / PE_TOTAL_USERS;
            } else {
                return 0;
            }
        }

        //GET topology PE Model by ID
        function findPEByID(pid) {
            for(var i = 0; i < _globals.edgeRouters.length; i++) {
                var d = _globals.edgeRouters[i].data();
                if (d.id == pid) return d;
            }
        }

        function slotCostModel(router, type) {
            var c = {
                cost : 0,
                ports : 0,
                capacity: 0
            };

            var routerModelType = "";
            switch (router) {
                case "PE":
                    routerModelType = "peCostModel";
                    break;
                case "P":
                    routerModelType = "pCostModel";
                    break;
                case "BX":
                    routerModelType = "bxCostModel";
                    break;
                default:
                    return c;
            }

            for (var i = 0; i < _globals[routerModelType].slots.length; i++) {
                var s = _globals.peCostModel.slots[i];
                if (s.config === type) {
                    c.cost = s.material * WARRANTY_INSTALL_PC;
                    c.ports = s.ports;
                    c.capacity = s.capacity;
                }
            }

            return c;
        }

        //Calculate cost of ALL PE slots for type == UNI or NNI
        function peUNISlotCost () {
            var UNISum = 0;
            for(var i = 0; i < $scope.peSelected.length; i++ ) {
                var peID = $scope.peSelected[i];
                var peModel = findPEByID(peID);
                //console.log(peModel);

                for(var j = 0; j < peModel.slots.length; j++) {

                    var s = peModel.slots[j];
                    //console.log(s);
                    if (s.indexOf("UNI") === 0) {

                        var m = slotCostModel("PE", "UNI");
                        UNISum += (m.cost / m.ports);
                    }
                }
            }
            return UNISum;
        }

        function selectedSpeedMB() {
            var s = $scope.selSpeed;
            if (stringEndsWith(s, "M")) {
                return +s.substr(0, s.length - 1);
            } else {
                return (+s.substr(0, s.length - 2)) * 1000;
            }
        }


        function peNNISlotCost () {
            var UNISum = 0;
            for(var i = 0; i < $scope.peSelected.length; i++ ) {
                var peID = $scope.peSelected[i];
                var peModel = findPEByID(peID);

                for(var j = 0; j < peModel.slots.length; j++) {

                    var s = peModel.slots[j];
                    //console.log(s);
                    if (s.indexOf("NNI") === 0) {

                        var m = slotCostModel("PE", "NNI");

                        UNISum += (selectedSpeedMB() / ( m.capacity * ROUTER_MAX_UTILIZATION)) * m.cost;
                    }
                }
            }
            return UNISum;

        }



        //console.log(_globals.peCostModel);


        //console.log(_globals.edgeRouters);


        //console.log("PE", peHardwareCost());

        //peUNICost();


    }]);

    app.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/dashboard-view.html',
                controller : 'DashController'
            })
            .when('/general-config', {
                templateUrl: 'views/generalconfig-view.html',
                controller : 'GeneralConfigController'
            })
            .when('/costmodel-config', {
                templateUrl: 'views/costmodel-view.html',
                controller : 'CostmodelConfigController'
            })
            .when('/topology-config', {
                templateUrl: 'views/topology-view.html',
                controller : 'TopologyConfigController'
            })
            .when('/case-analysis', {
                templateUrl: 'views/analysis-view.html',
                controller : 'AnalysisController'
            });

    }]);

    app.directive('routerModelEditor', ['_globals',function(_globals){
        return {
            restrict: 'E',
            scope: {
                id: "@",
                title: "@",
                model: "="
            },
            link : function(scope) {

                var desc;
                switch (scope.title) {
                    case "PE":
                        desc = "Provider Edge Router";
                        break;
                    case "P":
                        desc = "Provider Core Router";
                        break;
                    case "BX":
                        desc = "Border Router";
                        break;
                    default:
                        desc = "Router";
                }

                var schema = {
                    "type": "object",
                    "title": scope.title,
                    "description": desc,
                    "properties": {
                        "hardware": {
                            "type": "object",
                            "title": "Hardware Capital",
                            "properties": {
                                "chasis": {
                                    "title": "Chasis",
                                    "type" : "number",
                                    "minimum" : 0,
                                    "exclusiveMinimum" : false
                                },
                                "memory": {
                                    "title": "Memory",
                                    "type" : "number",
                                    "minimum" : 0,
                                    "exclusiveMinimum" : false
                                },
                                "power": {
                                    "title": "Power",
                                    "type" : "number",
                                    "minimum" : 0,
                                    "exclusiveMinimum" : false
                                },
                                "processor": {
                                    "title": "Processor",
                                    "type" : "number",
                                    "minimum" : 0,
                                    "exclusiveMinimum" : false
                                }
                            },
                            "format": "grid"

                        },
                        "slots" : {
                            "type" :"array",
                            "title" : "Slot Types",
                            "format" : "table",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {"type":"string", "title":"Name"},
                                    "config": {"type":"string", "title":"Config"},
                                    "cardType": {"type":"string", "title":"Card Type"},
                                    "ports": {"type":"number","capacity":"number", "title":"Ports"},
                                    "capacity": {"type":"number", "title":"Capacity (MB)"},
                                    "material": {"type":"number","title":"Material Cost ($)"}

                                }

                            }


                        }
                    }
                };

                var editor = new JSONEditor(
                    document.getElementById(scope.id),
                    {
                        theme: "bootstrap3",
                        iconlib: "fontawesome4",
                        disable_edit_json: false,
                        disable_properties: true,
                        disable_array_delete: false,
                        schema: schema

                    }
                );

                scope.$watch('model', function(d) {
                    //console.log("model updated", d);
                    editor.setValue(d);
                })

                //scope.validPE = true;
                //
                editor.on("change", function() {

                    var v = editor.getValue();

                    scope.$apply(function() {
                        scope.model = v;
                        switch (scope.title) {
                            case "P":
                                _globals.pCostModel = v;
                                break;
                            case "PE":
                                _globals.peCostModel = v;
                                break;
                            case "BX":
                                _globals.bxCostModel = v;
                                break;
                            default:

                        }
                    });

                });

            }
        }
    }]);

    app.directive('topologyModelEditor', ['_globals', function(_globals){
        return {
            restrict: 'E',
            scope: {
                id: '@',
                model : '='
            },
            link: function(scope) {

                var schema = {
                    type: "object",
                    title : "Network Topology",
                    properties: {
                        nodes: {
                            type: "array",
                            "format": "tabs",
                            title: "Routers",
                            items: {
                                type: "object",
                                title: "router",
                                "headerTemplate": "{{self.data.id}}",
                                properties: {
                                    data: {
                                        type: "object",
                                        title: "Details",
                                        properties: {
                                            id: {
                                                type: "string",
                                                title: "ID",
                                                description: "Each router must have a unique ID number."
                                            },
                                            slots: {
                                                type: "array",
                                                title: "Installed Slots",
                                                format:"table",

                                                items: {
                                                    type: "string",
                                                    enum: [
                                                        "UNI - 10BT/100BT - 2GE", "NNI - 40GE - 160GE",
                                                        "PE-P - 10GE - 100GE", "P-P/BX - 10BE - 400GE",
                                                        "BX-P - 10GE - 400GE", "Transit-peer - 100GE - 400GE"
                                                    ]
                                                }
                                            },
                                            parent:{
                                                type:"string",
                                                title: "Router Type",
                                                enum:["Core", "Edge"]
                                            }
                                        }
                                    },
                                    group: {
                                        type: "string",
                                        default:"nodes",
                                        description: "The type of data: nodes for router type",
                                        readonly: true
                                    }
                                }
                            }

                        },
                        edges: {
                            type: "array",
                            "format": "tabs",
                            title: "Links",
                            items: {
                                type: "object",
                                title: "link",
                                headerTemplate: "{{self.data.id}}",
                                properties: {
                                    data: {
                                        type: "object",
                                        title: "Details",
                                        properties : {
                                            id: {type: "string"},
                                            source: {type: "string"},
                                            target: {type: "string"}
                                        }
                                    },
                                    group: {
                                        type: "string",
                                        default:"edges",
                                        description: "The type of data: edges for links",
                                        readonly: true
                                    }
                                }
                            }
                        }
                    }
                };

                var editor = new JSONEditor(
                    document.getElementById(scope.id),
                    {
                        theme: "bootstrap3",
                        iconlib: "fontawesome4",
                        disable_edit_json: false,
                        disable_properties: true,
                        disable_array_delete: false,
                        disable_array_reorder: true,
                        schema: schema

                    }
                );

                editor.on("change", function() {
                    var v = editor.getValue();
                    scope.model = v;
                    scope.$apply(function() {
                        scope.$parent.topoModel = v;
                        _globals.topologyModel = v;
                    });
                });

                scope.$watch('model', function(d) {
                    editor.setValue(d);
                });
            }
        };
    }]);

}());