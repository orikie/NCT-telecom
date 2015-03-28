
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
           bxCostModel: {}
       };
    });

    app.factory('loadData', ['$http', 'globalOptions', function($http, globalOptions) {

        return {
            json: function(dataFile, cb) {

                var url = 'data/' + globalOptions[dataFile].value;
                $http.get(url, {
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

        return function() {

            this.draw = function(id) {
                console.log(id)


            }

        };
    }]);

    app.directive('networkVis', ['networkVisFactory', function(networkVisFactory) {

        return {
            restrict : 'E',
            scope : {
                id : '@'
            },
            link: function(scope) {
                console.log('yo')
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
            }
            ,
            "bx_cost": {
                "name" : "BX Cost File",
                "value" : "bx_cost.json",
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

    app.controller('TopologyConfigController', ['$scope', 'version', function($scope, version) {

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

    app.directive('routerModelEditor', [function(){
        return {
            restrict: 'E',
            scope: {
                id: "@",
                title: "@",
                model: "="
            },
            templateUrl: 'templates/routerModelEditorTemplate.html',
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

                var editorPE = new JSONEditor(
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
                    editorPE.setValue(d);
                })

                //scope.validPE = true;
                //
                //editorPE.on("change", function() {
                //
                //    var alertStatusPE = editorPE.validate().length ? "alert-danger" : "alert-success";
                //
                //    $("#peStatus").toggleClass(alertStatusPE, true);
                //
                //});

            }
        }
    }]);

}());