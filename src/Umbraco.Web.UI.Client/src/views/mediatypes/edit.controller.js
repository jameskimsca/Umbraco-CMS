/**
 * @ngdoc controller
 * @name Umbraco.Editors.MediaType.EditController
 * @function
 *
 * @description
 * The controller for the media type editor
 */
(function () {
    "use strict";

    function MediaTypesEditController($scope, $routeParams, mediaTypeResource, dataTypeResource, editorState, contentEditingHelper, formHelper, navigationService, iconHelper, contentTypeHelper, notificationsService, $filter, $q, localizationService) {
        var vm = this;

        vm.save = save;

        vm.currentNode = null;
        vm.contentType = {};
        vm.page = {};
        vm.page.loading = false;
        vm.page.saveButtonState = "init";
        vm.page.navigation = [
			{
			    "name": "Design",
			    "icon": "icon-document-dashed-line",
			    "view": "views/mediatypes/views/design/design.html",
			    "active": true
			},
			{
			    "name": "List view",
			    "icon": "icon-list",
			    "view": "views/mediatypes/views/listview/listview.html"
			},
			{
			    "name": "Permissions",
			    "icon": "icon-keychain",
			    "view": "views/mediatypes/views/permissions/permissions.html"
			}
        ];

        vm.page.keyboardShortcutsOverview = [
			{
			    "name": "Sections",
			    "shortcuts": [
					{
					    "description": "Navigate sections",
					    "keys": [{ "key": "1" }, { "key": "3" }],
					    "keyRange": true
					}
			    ]
			},
			{
			    "name": "Design",
			    "shortcuts": [
				{
				    "description": "Add tab",
				    "keys": [{ "key": "alt" }, { "key": "shift" }, { "key": "t" }]
				},
				{
				    "description": "Add property",
				    "keys": [{ "key": "alt" }, { "key": "shift" }, { "key": "p" }]
				},
				{
				    "description": "Add editor",
				    "keys": [{ "key": "alt" }, { "key": "shift" }, { "key": "e" }]
				},
				{
				    "description": "Edit data type",
				    "keys": [{ "key": "alt" }, { "key": "shift" }, { "key": "d" }]
				}
			    ]
			},
		{
		    "name": "List view",
		    "shortcuts": [
				{
				    "description": "Toggle list view",
				    "keys": [{ "key": "alt" }, { "key": "shift" }, { "key": "l" }]
				}
		    ]
		},
		{
		    "name": "Permissions",
		    "shortcuts": [
				{
				    "description": "Toggle allow as root",
				    "keys": [{ "key": "alt" }, { "key": "shift" }, { "key": "r" }]
				},
				{
				    "description": "Add child node",
				    "keys": [{ "key": "alt" }, { "key": "shift" }, { "key": "c" }]
				}
		    ]
		}
        ];

        if ($routeParams.create) {
            vm.page.loading = true;

            //we are creating so get an empty data type item
            mediaTypeResource.getScaffold($routeParams.id)
                .then(function(dt) {
                    init(dt);

                    vm.page.loading = false;
                });
        }
        else {
            vm.page.loading = true;

            mediaTypeResource.getById($routeParams.id).then(function(dt) {
                init(dt);

                syncTreeNode(vm.contentType, dt.path, true);

                vm.page.loading = false;
            });
        }

        /* ---------- SAVE ---------- */

        function save() {
            var deferred = $q.defer();

            vm.page.saveButtonState = "busy";

            // reformat allowed content types to array if id's
            vm.contentType.allowedContentTypes = contentTypeHelper.createIdArray(vm.contentType.allowedContentTypes);

            contentEditingHelper.contentEditorPerformSave({
                statusMessage: "Saving...",
                saveMethod: mediaTypeResource.save,
                scope: $scope,
                content: vm.contentType,
                //no-op for rebind callback... we don't really need to rebind for content types
                rebindCallback: angular.noop
            }).then(function (data) {
                //success            
                syncTreeNode(vm.contentType, data.path);

                vm.page.saveButtonState = "success";

                deferred.resolve(data);
            }, function (err) {
                //error
                if (err) {
                    editorState.set($scope.content);
                }
                else {
                    localizationService.localize("speechBubbles_validationFailedHeader").then(function (headerValue) {
                        localizationService.localize("speechBubbles_validationFailedMessage").then(function (msgValue) {
                            notificationsService.error(headerValue, msgValue);
                        });
                    });
                }

                vm.page.saveButtonState = "error";

                deferred.reject(err);
            });

            return deferred.promise;
        }

        function init(contentType) {
            //get available composite types
            mediaTypeResource.getAvailableCompositeContentTypes(contentType.id).then(function (result) {
                contentType.availableCompositeContentTypes = result;
                // convert legacy icons
                convertLegacyIcons(contentType);
            });

            // set all tab to inactive
            if (contentType.groups.length !== 0) {
                angular.forEach(contentType.groups, function (group) {

                    angular.forEach(group.properties, function (property) {
                        // get data type details for each property
                        getDataTypeDetails(property);
                    });

                });
            }
            
            // sort properties after sort order
            angular.forEach(contentType.groups, function (group) {
                group.properties = $filter('orderBy')(group.properties, 'sortOrder');
            });

            //set a shared state
            editorState.set(contentType);

            vm.contentType = contentType;
        }

        function convertLegacyIcons(contentType) {
            // make array to store contentType icon
            var contentTypeArray = [];

            // push icon to array
            contentTypeArray.push({ "icon": contentType.icon });

            // run through icon method
            iconHelper.formatContentTypeIcons(contentTypeArray);

            // set icon back on contentType
            contentType.icon = contentTypeArray[0].icon;
        }

        function getDataTypeDetails(property) {
            if (property.propertyState !== "init") {

                dataTypeResource.getById(property.dataTypeId)
                    .then(function(dataType) {
                        property.dataTypeIcon = dataType.icon;
                        property.dataTypeName = dataType.name;
                    });
            }
        }


        /** Syncs the content type  to it's tree node - this occurs on first load and after saving */
        function syncTreeNode(dt, path, initialLoad) {
            navigationService.syncTree({ tree: "mediatypes", path: path.split(","), forceReload: initialLoad !== true }).then(function(syncArgs) {
                vm.currentNode = syncArgs.node;
            });
        }
    }

    angular.module("umbraco").controller("Umbraco.Editors.MediaTypes.EditController", MediaTypesEditController);
})();
