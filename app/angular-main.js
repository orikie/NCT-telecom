
(function(){

    var app = angular.module('nctTelecom', ['ngRoute']);

    /**
     * Current Version
     */
    app.value('version', '0.0.3')
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
           topologyModel: {}
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
                            'content': 'data(id)'
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
                console.log(t);
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
                    console.log('valid', v);
                    if (!jQuery.isEmptyObject(d) && v) {
                        nvis.cy.load(d);
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

    /**
     * Main Page Controller
     */
    app.controller('MainController', ['$scope', 'version','repoLink', function($scope, version, repoLink) {
        $scope.version = version;
        $scope.repoLink = repoLink;

    }]);

    app.controller('DashController', ['$scope', 'version', function($scope, version) {

    }]);

    app.controller('GeneralConfigController', ['$scope', 'version', function($scope, version) {

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

    app.controller('AnalysisController', ['$scope', 'version', function($scope, version) {

    }]);

    /**
     * Page Routing
     */
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
                            "title" : "Slots",
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
    }])

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